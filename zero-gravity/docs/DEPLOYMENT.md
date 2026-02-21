# 0G Integration Deployment Guide

## Prerequisites

- Node.js 18+
- 0G Network testnet account
- Private keys for storage and compute

## Setup

1. Install dependencies:
```bash
cd zero-gravity
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Test storage integration:
```bash
npm run example:storage
```

4. Test compute integration:
```bash
npm run example:compute
```

## Production Deployment

### Storage Configuration

Set production RPC URLs:
```
ZG_STORAGE_RPC_URL=https://rpc-storage.0g.ai
ZG_STORAGE_INDEXER_URL=https://indexer-storage.0g.ai
```

### Compute Configuration

Set production compute endpoints:
```
ZG_COMPUTE_RPC_URL=https://rpc-compute.0g.ai
ZG_COMPUTE_BROKER_URL=https://broker-compute.0g.ai
```

## Monitoring

Monitor your 0G integration:
- Storage usage dashboard
- Compute task status
- Network performance metrics

## Support

For issues or questions:
- 0G Network Documentation: https://docs.0g.ai
- PAZE DAO Discord: [link]
