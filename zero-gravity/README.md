# 0G (Zero Gravity) Integration

This folder contains all the code and documentation demonstrating the integration of **0G Network's decentralized compute and storage infrastructure** in the PAZE DAO project.

## Overview

PAZE leverages 0G Network's cutting-edge infrastructure for:
- **0G Storage**: Decentralized storage for proposal data, analysis files, and evidence
- **0G Compute**: Distributed computation for AI-powered impact assessment and proposal validation

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PAZE DAO Platform                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐        ┌──────────────────┐      │
│  │  0G Storage      │        │   0G Compute     │      │
│  │  - Proposals     │        │   - AI Analysis  │      │
│  │  - Evidence      │        │   - Validation   │      │
│  │  - Analysis Data │        │   - Processing   │      │
│  └──────────────────┘        └──────────────────┘      │
│           │                           │                  │
│           └───────────┬───────────────┘                 │
│                       │                                  │
│              ┌────────▼────────┐                        │
│              │  Smart Contracts │                        │
│              │  (ADI Testnet)   │                        │
│              └──────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Storage Integration (`/storage`)
- 0G Storage client implementation
- File upload/download utilities
- Data verification and integrity checks
- IPFS compatibility layer

### 2. Compute Integration (`/compute`)
- 0G Compute node client
- AI model deployment scripts
- Distributed task execution
- Result aggregation

### 3. Smart Contracts (`/contracts`)
- 0G Storage proof verification
- Compute result validation
- Payment and incentive mechanisms

### 4. Examples (`/examples`)
- Complete workflow demonstrations
- Integration patterns
- Best practices

## Quick Start

```bash
# Install dependencies
npm install

# Configure 0G credentials
cp .env.example .env
# Edit .env with your 0G credentials

# Run storage example
npm run example:storage

# Run compute example
npm run example:compute
```

## Integration Points

### Proposal Storage
All DAO proposals are stored on 0G Storage with cryptographic proofs:
- Proposal metadata
- Evidence files (images, documents)
- Analysis results
- Voting records

### AI Processing
Impact assessment AI models run on 0G Compute:
- Image analysis for infrastructure issues
- Natural language processing for proposals
- Sentiment analysis for community feedback
- Predictive modeling for impact estimation

## Benefits

✅ **Decentralization**: No single point of failure
✅ **Cost Efficiency**: Lower storage and compute costs
✅ **Scalability**: Handles growing data and computation needs
✅ **Transparency**: All data and computations are verifiable
✅ **Performance**: High-speed data access and processing

## Documentation

- [Storage Integration Guide](./docs/STORAGE_INTEGRATION.md)
- [Compute Integration Guide](./docs/COMPUTE_INTEGRATION.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## License

MIT
