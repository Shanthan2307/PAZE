import argparse
import json
import math
import os
import subprocess
from dataclasses import dataclass
from typing import List, Tuple, Optional

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from tqdm import tqdm
from transformers import CLIPModel, CLIPProcessor
import pillow_heif


def extract_video_gps(video_path: str) -> Optional[dict]:
    """Extract GPS coordinates from video metadata using ffprobe"""
    try:
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            tags = data.get("format", {}).get("tags", {})
            
            # Look for GPS coordinates in various tag formats
            lat = tags.get("location-lat") or tags.get("com.apple.quicktime.location.ISO6709")
            lng = tags.get("location-lng")
            
            # Parse ISO 6709 format if present (e.g., "+37.5090+127.0620+0.000/")
            if lat and isinstance(lat, str) and lat.startswith("+"):
                parts = lat.replace("/", "").split("+")
                if len(parts) >= 3:
                    lat = float(parts[1])
                    lng = float(parts[2])
                    return {"latitude": lat, "longitude": lng}
            
            if lat and lng:
                return {"latitude": float(lat), "longitude": float(lng)}
    except Exception as e:
        print(f"Could not extract GPS from video: {e}")
    
    return None


def embed_gps_in_image(image_path: str, gps_data: dict) -> bool:
    """Embed GPS coordinates into image EXIF using exiftool"""
    try:
        lat = gps_data["latitude"]
        lng = gps_data["longitude"]
        
        cmd = [
            "exiftool",
            "-overwrite_original",
            f"-GPSLatitude={abs(lat)}",
            f"-GPSLatitudeRef={'N' if lat >= 0 else 'S'}",
            f"-GPSLongitude={abs(lng)}",
            f"-GPSLongitudeRef={'E' if lng >= 0 else 'W'}",
            image_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    except Exception as e:
        print(f"Could not embed GPS in image: {e}")
        return False


@dataclass
class Candidate:
    timestamp_s: float
    similarity: float
    sharpness: float
    frame_index: int


def variance_of_laplacian(bgr: np.ndarray) -> float:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def seconds_to_hhmmss(seconds: float) -> str:
    s = max(0.0, float(seconds))
    hh = int(s // 3600)
    mm = int((s % 3600) // 60)
    ss = s % 60
    return f"{hh:02d}:{mm:02d}:{ss:06.3f}"


def ffmpeg_extract_frame(video_path: str, timestamp_s: float, out_path: str, as_heic: bool = False) -> bool:
    ts = seconds_to_hhmmss(timestamp_s)
    
    if as_heic:
        # Extract as high-quality PNG first, then convert to HEIC
        temp_png = out_path.replace('.heic', '.png').replace('.HEIC', '.png')
        cmd = [
            "ffmpeg", "-y",
            "-ss", ts,
            "-i", video_path,
            "-frames:v", "1",
            "-q:v", "1",  # Highest quality
            "-map_metadata", "0",  # Copy all metadata from video
            temp_png,
        ]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True)
            if p.returncode == 0 and os.path.exists(temp_png):
                # Convert PNG to HEIC using pillow-heif
                img = Image.open(temp_png)
                pillow_heif.register_heif_opener()
                img.save(out_path, format="HEIF", quality=95)
                os.remove(temp_png)  # Clean up temp PNG
                return os.path.exists(out_path)
            return False
        except Exception as e:
            print(f"Error converting to HEIC: {e}")
            return False
    else:
        # Standard JPEG extraction with metadata
        cmd = [
            "ffmpeg", "-y",
            "-ss", ts,
            "-i", video_path,
            "-frames:v", "1",
            "-q:v", "2",
            "-map_metadata", "0",  # Copy all metadata from video
            out_path,
        ]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True)
            return p.returncode == 0 and os.path.exists(out_path)
        except FileNotFoundError:
            return False


def get_device() -> str:
    # Prefer Apple GPU (Metal) if available
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def apply_roi(frame_bgr: np.ndarray, roi: str) -> np.ndarray:
    if roi == "none":
        return frame_bgr
    h, w = frame_bgr.shape[:2]
    if roi == "bottom":
        return frame_bgr[h // 2 : h, 0:w]
    if roi == "bottom60":
        return frame_bgr[int(h * 0.4) : h, 0:w]
    if roi == "center":
        y0, y1 = int(h * 0.2), int(h * 0.8)
        x0, x1 = int(w * 0.2), int(w * 0.8)
        return frame_bgr[y0:y1, x0:x1]
    raise ValueError(f"Unknown ROI: {roi}")


def load_clip(device: str):
    model_name = "openai/clip-vit-base-patch32"
    processor = CLIPProcessor.from_pretrained(model_name)
    model = CLIPModel.from_pretrained(model_name).to(device)
    model.eval()
    return model, processor


@torch.no_grad()
def embed_text(model: CLIPModel, processor: CLIPProcessor, text: str, device: str) -> torch.Tensor:
    inputs = processor(text=[text], return_tensors="pt", padding=True).to(device)
    feats = model.get_text_features(**inputs)
    return F.normalize(feats, p=2, dim=-1)  # (1, d)


@torch.no_grad()
def embed_images_batch(
    model: CLIPModel,
    processor: CLIPProcessor,
    images: List[Image.Image],
    device: str,
) -> torch.Tensor:
    inputs = processor(images=images, return_tensors="pt").to(device)
    feats = model.get_image_features(**inputs)  # (B, d)
    return F.normalize(feats, p=2, dim=-1)


def find_best_frames(
    video_path: str,
    note: str,
    sample_fps: float,
    topk: int,
    roi: str,
    batch_size: int,
) -> Tuple[List[Candidate], float, str]:
    device = get_device()
    model, processor = load_clip(device)
    text_emb = embed_text(model, processor, note, device)  # (1, d)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    orig_fps = cap.get(cv2.CAP_PROP_FPS)
    if not orig_fps or math.isnan(orig_fps) or orig_fps <= 0:
        orig_fps = 30.0

    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration_s = frame_count / orig_fps if frame_count > 0 else 0.0
    interval = max(1, int(round(orig_fps / max(0.1, sample_fps))))
    estimated_samples = (frame_count // interval) if frame_count > 0 else None

    candidates: List[Candidate] = []
    frame_idx = 0
    batch_imgs: List[Image.Image] = []
    batch_meta: List[Tuple[int, float, float]] = []  # (frame_index, ts, sharpness)

    pbar = tqdm(total=estimated_samples, desc=f"Scanning frames (device={device})", unit="frame")

    while True:
        ok, frame_bgr = cap.read()
        if not ok:
            break

        if frame_idx % interval == 0:
            cropped = apply_roi(frame_bgr, roi)
            sharp = variance_of_laplacian(cropped)
            ts = frame_idx / orig_fps
            frame_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
            batch_imgs.append(Image.fromarray(frame_rgb))
            batch_meta.append((frame_idx, ts, sharp))
            pbar.update(1)

            if len(batch_imgs) >= batch_size:
                img_embs = embed_images_batch(model, processor, batch_imgs, device)  # (B, d)
                sims = (img_embs @ text_emb.T).squeeze(1).detach().cpu().numpy().tolist()
                for (fi, t, sh), sim in zip(batch_meta, sims):
                    candidates.append(
                        Candidate(
                            timestamp_s=t,
                            similarity=float(sim),
                            sharpness=float(sh),
                            frame_index=int(fi)
                        )
                    )
                batch_imgs.clear()
                batch_meta.clear()

        frame_idx += 1

    # flush leftover
    if batch_imgs:
        img_embs = embed_images_batch(model, processor, batch_imgs, device)
        sims = (img_embs @ text_emb.T).squeeze(1).detach().cpu().numpy().tolist()
        for (fi, t, sh), sim in zip(batch_meta, sims):
            candidates.append(
                Candidate(
                    timestamp_s=t,
                    similarity=float(sim),
                    sharpness=float(sh),
                    frame_index=int(fi)
                )
            )

    pbar.close()
    cap.release()

    # Sort by similarity then sharpness
    candidates.sort(key=lambda c: (c.similarity, c.sharpness), reverse=True)
    topk = max(1, topk)
    return candidates[:topk], duration_s, device


def main():
    ap = argparse.ArgumentParser(description="Video + note -> best matching snapshot (CLIP + ffmpeg)")
    ap.add_argument("--video", required=True, help="Path to input video")
    ap.add_argument("--note", required=True, help="Text note describing what you want snapped")
    ap.add_argument("--fps", type=float, default=2.0, help="Sampling FPS to scan (frames/sec)")
    ap.add_argument("--topk", type=int, default=5, help="Save top-k candidate timestamps")
    ap.add_argument("--out", default="snapshots", help="Output folder")
    ap.add_argument("--png", action="store_true", help="Export PNG instead of JPG")
    ap.add_argument("--heic", action="store_true", help="Export HEIC instead of JPG (preserves metadata)")
    ap.add_argument(
        "--roi",
        choices=["none", "bottom", "bottom60", "center"],
        default="bottom",
        help="Region of interest crop to improve matching (sidewalk = bottom/bottom60)"
    )
    ap.add_argument("--batch", type=int, default=24, help="Batch size for CLIP image embedding")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)

    top_candidates, duration_s, device = find_best_frames(
        video_path=args.video,
        note=args.note,
        sample_fps=args.fps,
        topk=args.topk,
        roi=args.roi,
        batch_size=args.batch,
    )

    best = top_candidates[0]
    
    # Determine output format
    if args.heic:
        ext = "heic"
    elif args.png:
        ext = "png"
    else:
        ext = "jpg"
    
    best_path = os.path.join(args.out, f"best_snapshot.{ext}")

    # Extract GPS from video
    print("\nExtracting GPS coordinates from video...")
    video_gps = extract_video_gps(args.video)
    if video_gps:
        print(f"Found GPS in video: {video_gps['latitude']:.6f}, {video_gps['longitude']:.6f}")
    else:
        print("No GPS coordinates found in video metadata")
        print("Using default location: Denver Downtown, CO")
        video_gps = {
            "latitude": 39.7392,
            "longitude": -104.9903
        }

    ok = ffmpeg_extract_frame(args.video, best.timestamp_s, best_path, as_heic=args.heic)
    if not ok:
        # Fallback: OpenCV grab near timestamp
        cap = cv2.VideoCapture(args.video)
        cap.set(cv2.CAP_PROP_POS_MSEC, best.timestamp_s * 1000.0)
        ret, frame_bgr = cap.read()
        cap.release()
        if not ret:
            raise RuntimeError("Failed to extract frame via ffmpeg and OpenCV.")
        
        if args.heic:
            # Convert to HEIC using pillow-heif
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)
            pillow_heif.register_heif_opener()
            img.save(best_path, format="HEIF", quality=95)
        else:
            cv2.imwrite(best_path, frame_bgr)
    
    # Embed GPS coordinates into the snapshot if available
    if video_gps and os.path.exists(best_path):
        print("Embedding GPS coordinates into snapshot...")
        if embed_gps_in_image(best_path, video_gps):
            print("✓ GPS coordinates embedded successfully")
        else:
            print("⚠ Could not embed GPS (exiftool may not be installed)")
            print("  Install with: brew install exiftool")

    report = {
        "video": os.path.abspath(args.video),
        "note": args.note,
        "roi": args.roi,
        "device": device,
        "sample_fps": args.fps,
        "duration_s": duration_s,
        "best": {
            "timestamp_s": best.timestamp_s,
            "timestamp_hhmmss": seconds_to_hhmmss(best.timestamp_s),
            "similarity": best.similarity,
            "sharpness": best.sharpness,
            "snapshot_path": os.path.abspath(best_path),
        },
        "top_candidates": [
            {
                "timestamp_s": c.timestamp_s,
                "timestamp_hhmmss": seconds_to_hhmmss(c.timestamp_s),
                "similarity": c.similarity,
                "sharpness": c.sharpness,
                "frame_index": c.frame_index,
            }
            for c in top_candidates
        ],
    }

    report_path = os.path.join(args.out, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n✅ Done")
    print(f"Device:         {device}")
    print(f"Best timestamp: {seconds_to_hhmmss(best.timestamp_s)} (sim={best.similarity:.4f}, sharp={best.sharpness:.1f})")
    print(f"Snapshot saved: {best_path}")
    print(f"Report saved:   {report_path}")


if __name__ == "__main__":
    main()
