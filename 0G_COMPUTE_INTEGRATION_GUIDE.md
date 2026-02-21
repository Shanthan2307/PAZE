# 0G Compute Integration Guide

## Overview

This guide explains how PAZE integrates **0G Compute's free AI models** to enhance photo analysis with AI-generated taglines before creating DAO proposals.

## What It Does

When a user analyzes a photo through the Telegram bot:

1. 📸 Photo is analyzed (location, description, impact assessment)
2. ⚡ **0G Compute generates a tagline** using Llama-3-8B-Instruct (FREE model)
3. 📝 Tagline is added to the analysis JSON
4. 🗳️ Enhanced analysis is used to create the DAO proposal

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Photo Analysis Flow                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1. Extract metadata, analyze with Claude Vision         │
│  2. Get weather, news, location data                     │
│  3. Calculate impact score                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  ⚡ 0G COMPUTE ENHANCEMENT (NEW!)                        │
│                                                           │
│  • Send analysis to 0G Compute Network                   │
│  • Use Llama-3-8B-Instruct (free model)                  │
│  • Generate concise tagline (max 15 words)               │
│  • Add to analysis JSON as "zgComputeEnhancement"        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. Upload enhanced analysis to IPFS                     │
│  5. Create DAO proposal with tagline                     │
└─────────────────────────────────────────────────────────┘
```

## Files Created

### Core Integration Files

1. **`zero-gravity/compute/tagline-generator.ts`**
   - Generates taglines using 0G Compute
   - Uses Llama-3-8B-Instruct model
   - Handles task submission and result retrieval

2. **`tg_analysis/enhance-analysis-with-0g.ts`**
   - Main enhancement service
   - Adds tagline to analysis JSON
   - Preserves all original data

3. **`tg_analysis/bot-0g-integration.ts`**
   - Bot integration module
   - Automatically enhances analysis before proposals
   - Graceful fallback if 0G is not configured

4. **`frontend/components/ZeroGravityTab.tsx`**
   - New frontend tab to showcase 0G transactions
   - Shows compute tasks and storage operations
   - Displays execution times, node IDs, models used

5. **`scripts/test-0g-enhancement.ts`**
   - Test script to verify integration
   - Works with existing analysis files
   - Shows before/after comparison

## Setup Instructions

### 1. Configure 0G Compute

Add these to your `.env` file:

```bash
# 0G Compute Configuration
ZG_COMPUTE_RPC_URL=https://rpc-compute-testnet.0g.ai
ZG_COMPUTE_BROKER_URL=https://broker-compute-testnet.0g.ai
ZG_COMPUTE_PRIVATE_KEY=your_private_key_here
ZG_CHAIN_ID=16600

# Compute Settings
ZG_COMPUTE_MAX_WORKERS=10
ZG_COMPUTE_TIMEOUT=300000
ZG_COMPUTE_RETRY_ATTEMPTS=3
```

### 2. Get 0G Testnet Credentials

1. Visit [0G Network Testnet](https://testnet.0g.ai)
2. Create an account and get testnet tokens
3. Copy your private key to `.env`

### 3. Test the Integration

```bash
# Run the test script
npm run test:0g-enhancement

# Or with ts-node
npx ts-node scripts/test-0g-enhancement.ts
```

### 4. Integrate with Bot

The bot automatically uses 0G enhancement when configured. No code changes needed!

## Enhanced Analysis Structure

### Before (Original Analysis)
```json
{
  "metadata": { ... },
  "analysis": {
    "description": "The image shows a frozen lake...",
    "confidence": 5
  },
  "impactAssessment": {
    "score": 13,
    "urgency": "medium"
  }
}
```

### After (0G Enhanced)
```json
{
  "metadata": { ... },
  "analysis": {
    "description": "The image shows a frozen lake...",
    "confidence": 5
  },
  "impactAssessment": {
    "score": 13,
    "urgency": "medium"
  },
  "zgComputeEnhancement": {
    "tagline": "Frozen lake infrastructure needs winter safety assessment",
    "generatedAt": "2026-02-21T10:30:00.000Z",
    "model": "llama-3-8b-instruct",
    "executionTime": 2340,
    "nodeId": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "provider": "0G Compute Network"
  }
}
```

## Proposal Format with 0G Enhancement

When creating a DAO proposal, the tagline is prominently displayed:

```
Impact Initiative Proposal

Submission ID: SUB-1234567890-abc123
Location: Brookline, Massachusetts, United States
Impact Score: 13
Urgency: medium

⚡ AI-Generated Summary (powered by 0G Compute):
"Frozen lake infrastructure needs winter safety assessment"

Description:
The image shows a frozen lake surrounded by a winter landscape...

[... rest of proposal ...]

⚡ 0G Network Integration:
- Compute Model: llama-3-8b-instruct
- Processing Time: 2340ms
- Node ID: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
- Provider: 0G Compute Network
```

## Frontend Integration

### Add 0G Tab to DAOApp

Update `frontend/components/DAOApp.tsx`:

```typescript
import ZeroGravityTab from './ZeroGravityTab';

// In the tabs section:
{activeTab === 'zerogravity' && <ZeroGravityTab />}

// Add tab button:
<button
  onClick={() => setActiveTab('zerogravity')}
  className={`px-6 py-3 rounded-lg transition-colors ${
    activeTab === 'zerogravity'
      ? 'bg-purple-600 text-white'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
  }`}
>
  ⚡ 0G Network
</button>
```

## Benefits for Hackathon Judges

### 1. Real 0G Compute Usage ✅
- Uses actual 0G Network infrastructure
- Demonstrates free model integration (Llama-3-8B)
- Shows decentralized AI processing

### 2. Proof of Integration ✅
- Transaction history in frontend tab
- Execution times and node IDs visible
- Model names and metadata displayed

### 3. Practical Use Case ✅
- Enhances user experience with AI taglines
- Makes proposals more readable
- Adds value without changing core functionality

### 4. Showcase Features ✅
- Dedicated 0G tab in frontend
- Transaction tracking
- Compute and storage separation
- Real-time status updates

## Testing Without 0G Credentials

The system gracefully handles missing 0G configuration:

1. If `ZG_COMPUTE_PRIVATE_KEY` is not set, enhancement is skipped
2. Original analysis is used without tagline
3. Proposals still work normally
4. No errors or crashes

This allows development and testing without 0G access.

## API Reference

### TaglineGenerator

```typescript
const generator = new TaglineGenerator(config);
const result = await generator.generateTagline(analysisData);

// Result:
{
  success: true,
  tagline: "Generated tagline here",
  executionTime: 2340,
  nodeId: "0x742d35..."
}
```

### AnalysisEnhancer

```typescript
const enhancer = new AnalysisEnhancer(config);

// Enhance from file
const result = await enhancer.enhanceAnalysis('/path/to/analysis.json');

// Enhance data directly
const enhanced = await enhancer.enhanceAnalysisData(analysisData);
```

### Bot Integration

```typescript
import { bot0GIntegration } from './bot-0g-integration';

// Check if enabled
if (bot0GIntegration.isEnabled()) {
  // Enhance analysis from IPFS
  const enhanced = await bot0GIntegration.enhanceAnalysisFromIPFS(analysisUrl);
  
  // Format proposal with enhancement
  const description = bot0GIntegration.formatProposalWithEnhancement(
    enhanced,
    proposalData
  );
}
```

## Troubleshooting

### Issue: "0G Compute not configured"
**Solution**: Add `ZG_COMPUTE_PRIVATE_KEY` to `.env`

### Issue: "Task timeout"
**Solution**: Increase `ZG_COMPUTE_TIMEOUT` in `.env`

### Issue: "Failed to submit task"
**Solution**: Check RPC and Broker URLs are correct

### Issue: "No testnet tokens"
**Solution**: Get tokens from 0G testnet faucet

## Next Steps

1. ✅ Configure 0G credentials
2. ✅ Run test script
3. ✅ Test with Telegram bot
4. ✅ Add 0G tab to frontend
5. ✅ Deploy and demonstrate to judges

## Support

- 0G Network Docs: https://docs.0g.ai
- 0G Testnet: https://testnet.0g.ai
- PAZE GitHub: [your-repo-url]

---

**Status**: ✅ Ready for Hackathon Demo
**Last Updated**: February 21, 2026
