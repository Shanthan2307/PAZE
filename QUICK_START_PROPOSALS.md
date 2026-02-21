# 🚀 Quick Start: Proposals Tab

## TL;DR

New "Proposals" tab lets you create DAO proposals from Pinata URLs in 3 steps:

1. Paste Image Pinata URL
2. Paste Analysis Pinata URL  
3. Click "Create Proposal"

Done! 🎉

## Access the Feature

```bash
# Server is running at:
http://localhost:3001

# Navigate to:
Sidebar → "Create Proposals"
```

## Example URLs

```
Image URL:
https://gateway.pinata.cloud/ipfs/QmYourImageCID

Analysis URL:
https://gateway.pinata.cloud/ipfs/QmYourAnalysisCID
```

## What Happens

1. System extracts CIDs from your URLs
2. Fetches analysis JSON from IPFS
3. Validates the data
4. Formats a proposal description
5. Submits to DAO contract
6. Returns Proposal ID + TX hash

## Requirements

✅ Wallet connected
✅ Valid Pinata URLs
✅ Analysis JSON with required fields
✅ Environment variables configured

## Environment Setup

Make sure `doa_adi/.env` has:

```bash
DAO_CHAIN_RPC_URL=https://rpc.ab.testnet.adifoundation.ai/
DAO_CHAIN_ID=99999
CREATE_PROPOSAL_PRIVATE_KEY=your_key
DAO_CONTRACT_ADDRESS=0x41791E1A83dFd0Eda28cC2A91FcB3AfB4722ffC4
```

## Test It Now

1. Open http://localhost:3001
2. Connect wallet
3. Click "Create Proposals"
4. Paste your Pinata URLs
5. Submit!

## Need Help?

- Full guide: `PROPOSALS_TAB_GUIDE.md`
- Setup guide: `SETUP_PROPOSALS_TAB.md`
- Complete docs: `PROPOSALS_TAB_COMPLETE.md`

## Architecture

```
User Input → Form → API → IPFS → Validate → Format → DAO Contract → Success!
```

That's it! Simple and powerful. 🚀
