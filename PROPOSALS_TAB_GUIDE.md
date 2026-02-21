# Proposals Tab - User Guide

## Overview

The new "Proposals" tab allows you to create DAO proposals directly from Pinata IPFS URLs. Simply paste the image and analysis URLs, and the system automatically processes them and creates a proposal on-chain.

## Features

✅ Simple form interface with two input fields
✅ Automatic CID extraction from various Pinata URL formats
✅ Real-time validation and error handling
✅ Backend integration with Impact Agent
✅ Automatic proposal creation on DAO contract
✅ Transaction hash and Proposal ID returned

## How to Use

### Step 1: Navigate to Proposals Tab

1. Open the PAZE frontend (http://localhost:3000)
2. Connect your wallet
3. Click on "Create Proposals" in the sidebar

### Step 2: Prepare Your Pinata URLs

You need two Pinata IPFS URLs:

1. **Image URL**: The IPFS link to the photo/image
   - Example: `https://gateway.pinata.cloud/ipfs/QmXxx...`

2. **Analysis URL**: The IPFS link to the analysis JSON file
   - Example: `https://gateway.pinata.cloud/ipfs/QmYyy...`

### Step 3: Submit the Form

1. Paste the Image Pinata URL in the first field
2. Paste the Analysis Pinata URL in the second field
3. Click "Create Proposal"
4. Wait for the transaction to complete

### Step 4: View Results

Once successful, you'll see:
- ✅ Success message
- Proposal ID (use this to view/vote on the proposal)
- Transaction hash (verify on block explorer)

The page will automatically redirect to the Voting tab after 3 seconds.

## Supported URL Formats

The system automatically extracts CIDs from these formats:

```
https://gateway.pinata.cloud/ipfs/Qm...
https://ipfs.io/ipfs/Qm...
ipfs://Qm...
Qm... (just the CID)
baf... (CIDv1 format)
```

## Analysis JSON Format

Your analysis JSON must include these required fields:

```json
{
  "metadata": {
    "timestamp": "2025-02-07T23:27:43.000Z",
    "location": {
      "coordinates": {
        "lat": 42.328,
        "lng": -71.133
      },
      "city": "City Name",
      "state": "State",
      "country": "Country"
    }
  },
  "analysis": {
    "description": "Detailed description of the situation...",
    "confidence": 85
  },
  "context": {
    "weather": {
      "temperature": 22,
      "conditions": "Clear"
    }
  },
  "impactAssessment": {
    "score": 85,
    "category": "Infrastructure",
    "urgency": "High",
    "estimatedImpact": "Affects 5000+ residents",
    "recommendedActions": [
      "Action 1",
      "Action 2"
    ]
  }
}
```

## Backend Process

When you submit the form, here's what happens:

1. **Frontend Validation**
   - Extracts CIDs from URLs
   - Validates URL format

2. **API Call** (`/api/create-proposal`)
   - Receives imageCID and analysisCID
   - Fetches analysis JSON from IPFS
   - Validates data structure

3. **Impact Agent Processing**
   - Formats proposal description
   - Includes all relevant data
   - Adds IPFS links for verification

4. **Smart Contract Interaction**
   - Connects to DAO contract
   - Calls `createProposal()` function
   - Waits for transaction confirmation

5. **Response**
   - Returns Proposal ID
   - Returns transaction hash
   - Returns block number

## Environment Variables

Make sure these are set in your `.env` file:

```bash
# DAO Configuration
DAO_CHAIN_RPC_URL=https://rpc.ab.testnet.adifoundation.ai/
DAO_CHAIN_ID=99999
CREATE_PROPOSAL_PRIVATE_KEY=your_private_key_here
DAO_CONTRACT_ADDRESS=0x41791E1A83dFd0Eda28cC2A91FcB3AfB4722ffC4
```

## API Endpoint

### POST `/api/create-proposal`

**Request Body:**
```json
{
  "imageCID": "QmXxx...",
  "analysisCID": "QmYyy...",
  "imageUrl": "https://gateway.pinata.cloud/ipfs/QmXxx...",
  "analysisUrl": "https://gateway.pinata.cloud/ipfs/QmYyy..."
}
```

**Success Response:**
```json
{
  "success": true,
  "proposalId": "0x123...",
  "txHash": "0xabc...",
  "blockNumber": 12345,
  "message": "Proposal created successfully"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Stack trace (in development)"
}
```

## Troubleshooting

### "Invalid Pinata URL"
- Make sure you're pasting the full IPFS URL
- Check that the CID is valid (starts with Qm or baf)

### "Failed to fetch from IPFS"
- Verify the URL is accessible
- Check your internet connection
- Try accessing the URL directly in a browser

### "Analysis data validation failed"
- Ensure your JSON has all required fields
- Check the format matches the expected structure
- Verify coordinates are numbers, not strings

### "DAO_CHAIN_RPC_URL not configured"
- Check your `.env` file has all required variables
- Restart the development server after adding variables

### "Transaction failed"
- Ensure the wallet has enough ADI for gas
- Verify you're a DAO member (join first if needed)
- Check the contract address is correct

## Files Created

1. **`frontend/components/CreateProposalForm.tsx`**
   - React component for the form UI
   - Handles user input and validation
   - Makes API calls

2. **`frontend/app/api/create-proposal/route.ts`**
   - Next.js API route
   - Fetches data from IPFS
   - Validates and processes data
   - Creates proposal on-chain

3. **`frontend/app/page.tsx`** (modified)
   - Added "Proposals" tab to navigation
   - Integrated CreateProposalForm component

## Testing

### Test with Sample Data

1. Upload a test image to Pinata
2. Upload a test analysis JSON to Pinata
3. Copy both URLs
4. Paste into the form
5. Submit and verify the proposal is created

### Verify on Block Explorer

Visit: https://explorer.ab.testnet.adifoundation.ai/tx/[YOUR_TX_HASH]

### View in Frontend

1. Go to "Voting (DAO)" tab
2. Enter the Proposal ID
3. View the full proposal details

## Next Steps

- Add image preview when URL is pasted
- Show analysis summary before submission
- Add proposal history/tracking
- Implement batch proposal creation
- Add Telegram bot integration for automated submissions

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure you're connected to the correct network
4. Check you have enough ADI for gas fees

Happy proposing! 🚀
