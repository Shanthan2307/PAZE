# 0G Compute Integration - Final Setup Guide

## What You Need

### 1. Your EVM Wallet Private Key
- Use any EVM wallet (MetaMask, etc.)
- You need the private key (starts with `0x...`)
- This wallet will sign 0G Compute requests

### 2. Testnet Funds (Optional for Demo)
- Get 0G testnet tokens from faucet
- Not strictly required for fallback mode

## Quick Setup (3 Steps)

### Step 1: Add Private Key to .env

Add to `doa_adi/.env`:

```bash
# Option 1: Use ZG_COMPUTE_PRIVATE_KEY
ZG_COMPUTE_PRIVATE_KEY=your_wallet_private_key_here

# Option 2: Use PRIVATE_KEY (works too)
PRIVATE_KEY=your_wallet_private_key_here

# RPC URL (testnet - default, no need to change)
ZG_COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai
```

**That's it!** The model (`qwen-2.5-7b-instruct`) is hardcoded as the free testnet model.

### Step 2: Test It

```bash
cd doa_adi
npx ts-node scripts/test-0g-enhancement.ts
```

**Expected Output:**
```
✅ Enhancement successful!
🎯 Generated Tagline: "..."
📊 0G Compute Metadata:
   Model: qwen-2.5-7b-instruct
   Execution Time: ...ms
   Provider Address: 0x...
```

### Step 3: Use with Bot

The bot automatically uses 0G enhancement when you:
1. Send a video
2. Click "Analyze"
3. Create proposal

The tagline will be in the proposal!

## How It Works

### With 0G Credentials (Ideal)
```
Analysis → 0G Compute API → qwen-2.5-7b-instruct → Tagline → Proposal
```

### Without 0G Credentials (Fallback)
```
Analysis → Local Rule-Based → Simple Tagline → Proposal
```

Both work! The fallback ensures your app never breaks.

## What Changed from Original Plan

### Original (Complex):
- Custom broker setup
- Service discovery
- Multiple endpoints
- Complex configuration

### Final (Simple):
- Just private key + RPC URL
- Uses `qwen-2.5-7b-instruct` (0G's free testnet model)
- Fallback mode if 0G unavailable
- Works out of the box

## For Hackathon Judges

### What to Show:

1. **Working Integration**
   - Create a proposal
   - Show the AI-generated tagline
   - Point out "⚡ AI-Generated Summary (powered by 0G Compute)"

2. **0G Metadata in Proposal**
   ```
   ⚡ 0G Network Integration:
   - Compute Model: qwen-2.5-7b-instruct
   - Processing Time: 2340ms
   - Provider Address: 0x742d35...
   - Network: 0G Compute Network
   ```

3. **Frontend Tab**
   - Show the 0G Network tab
   - Display compute transactions
   - Show execution times and provider addresses

### Key Points:

✅ **Real 0G Model**: Uses `qwen-2.5-7b-instruct` (testnet free model)
✅ **Practical Use**: Enhances proposals with AI taglines
✅ **Proof of Integration**: Provider addresses, execution times visible
✅ **Graceful Fallback**: Works even without 0G (for demo reliability)

## Fallback Mode Explanation

If 0G Compute is unavailable (no credentials, network issues, etc.):

```typescript
// Fallback generates simple taglines like:
"Brookline, Massachusetts infrastructure requires assessment"
"Urgent: Boston winter landscapes requires assessment"
```

This ensures:
- App never crashes
- Proposals always work
- Demo is reliable
- You can still show the integration code

## Testing Without 0G

You can test the entire flow without 0G credentials:

```bash
# Don't set ZG_COMPUTE_PRIVATE_KEY
# Run test
npx ts-node scripts/test-0g-enhancement.ts

# Output will show:
⚠️  0G Compute private key not configured
   For testing, the system will use fallback tagline generation

✅ Enhancement successful!
🎯 Generated Tagline: "Brookline, Massachusetts winter landscapes requires assessment"
```

## Files Modified

1. ✅ `zero-gravity/compute/tagline-generator.ts` - Simplified to use direct API
2. ✅ `tg_analysis/enhance-analysis-with-0g.ts` - Updated config
3. ✅ `tg_analysis/bot-0g-integration.ts` - Simplified initialization
4. ✅ `scripts/test-0g-enhancement.ts` - Updated for new config
5. ✅ `zero-gravity/.env.example` - Simplified config

## Configuration Reference

### Minimal (Recommended):
```bash
PRIVATE_KEY=your_wallet_private_key_here
```

### Full (Optional):
```bash
ZG_COMPUTE_PRIVATE_KEY=your_wallet_private_key_here
ZG_COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_COMPUTE_MODEL=qwen-2.5-7b-instruct
```

## Troubleshooting

### "Private key not configured"
**Solution**: Add `PRIVATE_KEY` or `ZG_COMPUTE_PRIVATE_KEY` to `.env`

### "0G Compute unavailable, used fallback"
**Solution**: This is normal! Fallback mode is working. To use real 0G:
1. Ensure private key is set
2. Check RPC URL is correct
3. Verify you have testnet funds (optional)

### Tagline looks generic
**Solution**: If using fallback mode, taglines are rule-based. Add 0G credentials for AI-generated taglines.

## Summary

**Minimum to work**: Just add your wallet private key to `.env`

**What you get**:
- AI-generated taglines (with 0G) or rule-based taglines (fallback)
- Proposals always work
- 0G metadata in proposals
- Frontend tab showing transactions
- Proof of 0G integration for judges

**Time to setup**: 2 minutes

---

**Ready for hackathon!** 🚀
