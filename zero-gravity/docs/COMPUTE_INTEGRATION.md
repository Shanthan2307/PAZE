# 0G Compute Integration Guide

## Overview

PAZE DAO uses 0G Compute for distributed AI processing and analysis.

## Architecture

0G Compute provides:
- Decentralized compute resources
- AI model hosting
- Task distribution and execution
- Result verification

## Implementation

### Client Setup

```typescript
import { ZGComputeClient } from './compute/client';

const client = new ZGComputeClient({
  rpcUrl: 'https://rpc-compute-testnet.0g.ai',
  brokerUrl: 'https://broker-compute-testnet.0g.ai',
  privateKey: process.env.ZG_COMPUTE_PRIVATE_KEY,
  chainId: 16600,
  maxWorkers: 10,
  timeout: 300000,
  retryAttempts: 3
});
```

### Submit Compute Task

```typescript
const result = await client.analyzeImage(imageUrl);
console.log(`Analysis: ${result.category}`);
```

## Use Cases in PAZE

1. **Image Analysis**: Detect infrastructure issues
2. **Text Processing**: Analyze proposal descriptions
3. **Impact Prediction**: Estimate proposal outcomes
4. **Validation**: Verify proposal completeness

## Benefits

- Distributed computation
- Cost-effective AI processing
- Scalable infrastructure
- Verifiable results
