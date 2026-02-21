# Setup Guide: Proposals Tab

## Quick Start

Follow these steps to get the Proposals tab up and running:

### 1. Install Dependencies

```bash
cd doa_adi/frontend
npm install
```

This will install the new dependencies:
- `axios` - For fetching data from IPFS
- `@rainbow-me/rainbowkit` - Already in use for wallet connection

### 2. Configure Environment Variables

Make sure your `doa_adi/.env` file has these variables:

```bash
# DAO Configuration for Impact Agent
DAO_CHAIN_RPC_URL=https://rpc.ab.testnet.adifoundation.ai/
DAO_CHAIN_ID=99999
CREATE_PROPOSAL_PRIVATE_KEY=6b4e7ce3cd9854d4f56cccf59393719ff49ced65ea85ffd074efb2215a7e512e
DAO_CONTRACT_ADDRESS=0x41791E1A83dFd0Eda28cC2A91FcB3AfB4722ffC4
```

### 3. Start the Development Server

```bash
cd doa_adi/frontend
npm run dev
```

The app will be available at http://localhost:3000

### 4. Test the Feature

1. Open http://localhost:3000
2. Connect your wallet
3. Click "Create Proposals" in the sidebar
4. Paste your Pinata URLs:
   - Image URL: `https://gateway.pinata.cloud/ipfs/[YOUR_IMAGE_CID]`
   - Analysis URL: `https://gateway.pinata.cloud/ipfs/[YOUR_ANALYSIS_CID]`
5. Click "Create Proposal"
6. Wait for confirmation

## What Was Built

### Frontend Components

1. **CreateProposalForm.tsx**
   - Form with two input fields (image URL, analysis URL)
   - CID extraction from various URL formats
   - Loading states and error handling
   - Success feedback with proposal ID and tx hash

### Backend API

2. **api/create-proposal/route.ts**
   - Fetches analysis JSON from IPFS
   - Validates data structure
   - Formats proposal description
   - Creates proposal on DAO contract
   - Returns proposal ID and transaction details

### UI Integration

3. **Updated page.tsx**
   - Added "Proposals" tab to navigation
   - Integrated CreateProposalForm component
   - Auto-redirect to voting tab after success

## Architecture Flow

```
User Input (Pinata URLs)
    ↓
Frontend Form (CreateProposalForm.tsx)
    ↓
Extract CIDs from URLs
    ↓
POST /api/create-proposal
    ↓
Fetch Analysis from IPFS (axios)
    ↓
Validate Data Structure
    ↓
Format Proposal Description
    ↓
Connect to DAO Contract (ethers.js)
    ↓
Call createProposal() function
    ↓
Wait for Transaction Confirmation
    ↓
Return Proposal ID & TX Hash
    ↓
Display Success Message
```

## Testing Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Wallet connected
- [ ] Can access Proposals tab
- [ ] Form accepts Pinata URLs
- [ ] CID extraction works
- [ ] API endpoint responds
- [ ] Proposal created on-chain
- [ ] Transaction hash returned
- [ ] Proposal ID displayed
- [ ] Can view proposal in Voting tab

## Example Test Data

### Sample Analysis JSON Structure

```json
{
  "metadata": {
    "timestamp": "2026-02-21T10:00:00.000Z",
    "location": {
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "city": "San Francisco",
      "state": "California",
      "country": "United States"
    }
  },
  "analysis": {
    "description": "Community park cleanup initiative with 50+ volunteers",
    "confidence": 92
  },
  "context": {
    "weather": {
      "temperature": 18,
      "conditions": "Sunny"
    }
  },
  "impactAssessment": {
    "score": 88,
    "category": "Environmental",
    "urgency": "Medium",
    "estimatedImpact": "Improved park conditions for 10,000+ residents",
    "recommendedActions": [
      "Continue monthly cleanups",
      "Install recycling bins",
      "Organize community events"
    ]
  }
}
```

## Troubleshooting

### Port Already in Use

If port 3000 is busy:
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

```bash
# Make sure .env is in the root of doa_adi folder
ls -la doa_adi/.env

# Restart the dev server after adding variables
```

### CORS Issues

The API route is in the same Next.js app, so CORS shouldn't be an issue. If you see CORS errors, check that you're making requests to the same domain.

## Next Features to Add

1. **Image Preview**: Show the image when URL is pasted
2. **Analysis Preview**: Display analysis summary before submission
3. **Proposal History**: Track all proposals created via this interface
4. **Batch Creation**: Submit multiple proposals at once
5. **Telegram Integration**: Auto-submit from Telegram bot messages
6. **Draft Saving**: Save incomplete proposals as drafts
7. **Template System**: Pre-fill common proposal types

## Production Deployment

Before deploying to production:

1. **Security**
   - Move private key to secure key management
   - Add rate limiting to API endpoint
   - Implement authentication/authorization
   - Validate user is DAO member before allowing submission

2. **Performance**
   - Add caching for IPFS fetches
   - Implement retry logic for failed transactions
   - Add transaction queue for high volume

3. **Monitoring**
   - Log all proposal creations
   - Track success/failure rates
   - Monitor gas costs
   - Alert on errors

## Support

Need help? Check:
- `PROPOSALS_TAB_GUIDE.md` - User guide
- `IMPACT_AGENT_README.md` - Impact agent documentation
- Console logs in browser DevTools
- API logs in terminal

Happy building! 🎉
