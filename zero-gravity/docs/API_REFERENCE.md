# 0G Integration API Reference

## ZGStorageClient

### Constructor
```typescript
new ZGStorageClient(config: ZGStorageConfig)
```

### Methods

#### uploadFile(filePath: string): Promise<UploadResult>
Upload a file to 0G Storage.

#### uploadJSON(data: any): Promise<UploadResult>
Upload JSON data to 0G Storage.

#### downloadFile(merkleRoot: string): Promise<Buffer>
Download a file from 0G Storage.

#### downloadJSON(merkleRoot: string): Promise<any>
Download and parse JSON from 0G Storage.

#### verifyFile(merkleRoot: string, fileBuffer: Buffer): Promise<boolean>
Verify file integrity.

## ZGComputeClient

### Constructor
```typescript
new ZGComputeClient(config: ZGComputeConfig)
```

### Methods

#### submitTask(task: ComputeTask): Promise<string>
Submit a compute task to 0G Network.

#### getResult(taskId: string): Promise<ComputeResult>
Get the result of a compute task.

#### analyzeImage(imageUrl: string): Promise<any>
Run image analysis on 0G Compute.

#### analyzeText(text: string): Promise<any>
Run NLP analysis on 0G Compute.

#### predictImpact(proposalData: any): Promise<any>
Run impact prediction on 0G Compute.

#### validateProposal(proposalData: any): Promise<any>
Validate proposal on 0G Compute.
