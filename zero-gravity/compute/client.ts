import { ethers } from 'ethers';
import axios from 'axios';

export interface ZGComputeConfig {
  rpcUrl: string;
  brokerUrl: string;
  privateKey: string;
  chainId: number;
  maxWorkers: number;
  timeout: number;
  retryAttempts: number;
}

export interface ComputeTask {
  id: string;
  type: 'image-analysis' | 'nlp' | 'prediction' | 'validation';
  input: any;
  model: string;
  priority: number;
}

export interface ComputeResult {
  taskId: string;
  status: 'completed' | 'failed' | 'pending';
  result: any;
  executionTime: number;
  nodeId: string;
  timestamp: number;
}

export class ZGComputeClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: ZGComputeConfig;

  constructor(config: ZGComputeConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  /**
   * Submit compute task to 0G Network
   */
  async submitTask(task: ComputeTask): Promise<string> {
    console.log(`[0G Compute] Submitting task: ${task.type}`);

    const taskPayload = {
      id: task.id,
      type: task.type,
      input: task.input,
      model: task.model,
      priority: task.priority,
      requester: this.wallet.address,
      timestamp: Date.now()
    };

    // Sign task
    const signature = await this.signTask(taskPayload);

    // Submit to broker
    const response = await axios.post(`${this.config.brokerUrl}/submit`, {
      task: taskPayload,
      signature
    });

    console.log(`[0G Compute] Task submitted: ${response.data.taskId}`);
    return response.data.taskId;
  }

  /**
   * Get task result
   */
  async getResult(taskId: string): Promise<ComputeResult> {
    console.log(`[0G Compute] Fetching result for task: ${taskId}`);

    let attempts = 0;
    while (attempts < this.config.retryAttempts) {
      try {
        const response = await axios.get(`${this.config.brokerUrl}/result/${taskId}`);
        
        if (response.data.status === 'completed') {
          console.log(`[0G Compute] Task completed: ${taskId}`);
          return response.data;
        }

        if (response.data.status === 'failed') {
          throw new Error(`Task failed: ${response.data.error}`);
        }

        // Wait before retry
        await this.sleep(5000);
        attempts++;
      } catch (error) {
        if (attempts >= this.config.retryAttempts - 1) {
          throw error;
        }
        await this.sleep(5000);
        attempts++;
      }
    }

    throw new Error(`Task timeout: ${taskId}`);
  }

  /**
   * Run image analysis on 0G Compute
   */
  async analyzeImage(imageUrl: string): Promise<any> {
    const task: ComputeTask = {
      id: this.generateTaskId(),
      type: 'image-analysis',
      input: { imageUrl },
      model: 'vision-transformer-v1',
      priority: 1
    };

    const taskId = await this.submitTask(task);
    const result = await this.getResult(taskId);
    return result.result;
  }

  /**
   * Run NLP analysis on 0G Compute
   */
  async analyzeText(text: string): Promise<any> {
    const task: ComputeTask = {
      id: this.generateTaskId(),
      type: 'nlp',
      input: { text },
      model: 'bert-base-v1',
      priority: 1
    };

    const taskId = await this.submitTask(task);
    const result = await this.getResult(taskId);
    return result.result;
  }

  /**
   * Run impact prediction on 0G Compute
   */
  async predictImpact(proposalData: any): Promise<any> {
    const task: ComputeTask = {
      id: this.generateTaskId(),
      type: 'prediction',
      input: proposalData,
      model: 'impact-predictor-v1',
      priority: 2
    };

    const taskId = await this.submitTask(task);
    const result = await this.getResult(taskId);
    return result.result;
  }

  /**
   * Validate proposal on 0G Compute
   */
  async validateProposal(proposalData: any): Promise<any> {
    const task: ComputeTask = {
      id: this.generateTaskId(),
      type: 'validation',
      input: proposalData,
      model: 'proposal-validator-v1',
      priority: 3
    };

    const taskId = await this.submitTask(task);
    const result = await this.getResult(taskId);
    return result.result;
  }

  /**
   * Sign task with wallet
   */
  private async signTask(task: any): Promise<string> {
    const message = JSON.stringify(task);
    return await this.wallet.signMessage(message);
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
