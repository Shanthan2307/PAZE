# 0G Storage Integration Guide

## Overview

This guide explains how PAZE DAO integrates with 0G Storage for decentralized data storage.

## Architecture

0G Storage provides a decentralized alternative to traditional cloud storage with:
- Merkle tree-based data verification
- Distributed storage across multiple nodes
- On-chain proof of storage
- High availability and redundancy

## Implementation

### Client Setup

```typescript
import { ZGStorageClient } from './storage/client';

const client = new ZGStorageClient({
  rpcUrl: 'https://rpc-storage-testnet.0g.ai',
  indexerUrl: 'https://indexer-storage-testnet.0g.ai',
  flowContract: '0x0460aA47b41a66694c0a73f667a1b795A5ED3556',
  privateKey: process.env.ZG_STORAGE_PRIVATE_KEY,
  chainId: 16600,
  maxFileSize: 104857600,
  chunkSize: 262144,
  replicaCount: 3
});
```

### Upload Data

```typescript
const proposalData = {
  title: 'Infrastructure Repair',
  description: 'Repair damaged sidewalks',
  evidence: { /* ... */ }
};

const result = await client.uploadJSON(proposalData);
console.log(`Stored at: ${result.root}`);
```

### Download Data

```typescript
const data = await client.downloadJSON(result.root);
console.log(data.title);
```

## Use Cases in PAZE

1. **Proposal Storage**: All proposals stored on 0G
2. **Evidence Files**: Images and documents
3. **Analysis Results**: AI-generated insights
4. **Voting Records**: Immutable voting history

## Benefits

- Decentralized and censorship-resistant
- Cost-effective compared to traditional storage
- Cryptographically verifiable
- High availability
