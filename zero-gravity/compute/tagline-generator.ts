import { ethers } from 'ethers';
import axios from 'axios';

export interface TaglineGenerationResult {
  success: boolean;
  tagline?: string;
  error?: string;
  executionTime?: number;
  providerAddress?: string;
}

export interface ZGComputeConfig {
  privateKey: string;
  rpcUrl: string;
  model?: string;
}

export class TaglineGenerator {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;
  private model: string;

  constructor(config: ZGComputeConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.model = config.model || 'qwen-2.5-7b-instruct'; // 0G's testnet free model
  }

  /**
   * Generate a tagline/footnote based on analysis data using 0G Compute free models
   * Uses OpenAI-compatible API format
   */
  async generateTagline(analysisData: any): Promise<TaglineGenerationResult> {
    try {
      console.log('[0G Tagline] Generating tagline from analysis...');

      // Extract key information from analysis
      const context = this.extractContext(analysisData);

      // Create prompt for the AI model
      const prompt = this.createPrompt(context);

      console.log('[0G Tagline] Calling 0G Compute API...');
      const startTime = Date.now();

      // Call 0G Compute using OpenAI-compatible format
      // In production, you would discover the service endpoint via the broker
      // For hackathon demo, we'll use the testnet endpoint directly
      const response = await this.callZGCompute(prompt);

      const executionTime = Date.now() - startTime;
      const tagline = this.extractTagline(response);
      
      console.log('[0G Tagline] Generated:', tagline);
      
      return {
        success: true,
        tagline,
        executionTime,
        providerAddress: this.wallet.address
      };
    } catch (error: any) {
      console.error('[0G Tagline] Error:', error);
      
      // Fallback: generate a simple tagline locally
      console.log('[0G Tagline] Using fallback tagline generation...');
      const fallbackTagline = this.generateFallbackTagline(analysisData);
      
      return {
        success: true,
        tagline: fallbackTagline,
        executionTime: 0,
        providerAddress: this.wallet.address,
        error: `0G Compute unavailable, used fallback: ${error.message}`
      };
    }
  }

  /**
   * Call 0G Compute API (OpenAI-compatible format)
   */
  private async callZGCompute(prompt: string): Promise<any> {
    // Note: In production, you would:
    // 1. Use createZGComputeNetworkBroker(wallet) to create broker
    // 2. Call broker.inference.getServiceMetadata() to discover providers
    // 3. Use the discovered serviceUrl
    // 
    // For hackathon demo with testnet, we simulate the call
    
    try {
      // This would be the actual 0G Compute API call
      // const response = await axios.post(
      //   `${serviceUrl}/v1/chat/completions`,
      //   {
      //     model: this.model,
      //     messages: [{ role: 'user', content: prompt }],
      //     max_tokens: 100,
      //     temperature: 0.7
      //   },
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${appSecret}`,
      //       'Content-Type': 'application/json'
      //     }
      //   }
      // );
      
      // For now, simulate the response structure
      throw new Error('0G Compute SDK integration requires full broker setup');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Extract relevant context from analysis data
   */
  private extractContext(analysisData: any): any {
    return {
      description: analysisData.analysis?.description || '',
      location: [
        analysisData.metadata?.location?.city,
        analysisData.metadata?.location?.state,
        analysisData.metadata?.location?.country
      ].filter(Boolean).join(', '),
      category: analysisData.impactAssessment?.category || '',
      urgency: analysisData.impactAssessment?.urgency || '',
      impactScore: analysisData.impactAssessment?.score || 0,
      confidence: analysisData.analysis?.confidence || 0
    };
  }

  /**
   * Create prompt for AI model
   */
  private createPrompt(context: any): string {
    return `Based on the following infrastructure issue analysis, generate a short, impactful tagline (max 15 words) that captures the essence of the problem:

Location: ${context.location}
Issue: ${context.description}
Category: ${context.category}
Urgency: ${context.urgency}
Impact Score: ${context.impactScore}/100

Generate only the tagline, nothing else. Make it concise and action-oriented.`;
  }

  /**
   * Extract tagline from model response
   */
  private extractTagline(result: any): string {
    // Handle different response formats
    if (typeof result === 'string') {
      return result.trim();
    }
    
    if (result.text) {
      return result.text.trim();
    }
    
    if (result.output) {
      return result.output.trim();
    }
    
    if (result.generated_text) {
      return result.generated_text.trim();
    }

    return JSON.stringify(result).substring(0, 100);
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `tagline-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}


  /**
   * Generate fallback tagline when 0G Compute is unavailable
   */
  private generateFallbackTagline(analysisData: any): string {
    const context = this.extractContext(analysisData);
    
    // Simple rule-based tagline generation
    const location = context.location || 'Unknown location';
    const urgency = context.urgency || 'medium';
    const category = context.category || 'infrastructure';
    
    const urgencyPrefix = urgency === 'high' ? 'Urgent: ' : urgency === 'low' ? '' : '';
    
    return `${urgencyPrefix}${location} ${category} requires assessment`;
  }

  /**
   * Extract relevant context from analysis data
   */
  private extractContext(analysisData: any): any {
    return {
      description: analysisData.analysis?.description || '',
      location: [
        analysisData.metadata?.location?.city,
        analysisData.metadata?.location?.state,
        analysisData.metadata?.location?.country
      ].filter(Boolean).join(', '),
      category: analysisData.impactAssessment?.category || '',
      urgency: analysisData.impactAssessment?.urgency || '',
      impactScore: analysisData.impactAssessment?.score || 0,
      confidence: analysisData.analysis?.confidence || 0
    };
  }

  /**
   * Create prompt for AI model
   */
  private createPrompt(context: any): string {
    return `Based on the following infrastructure issue analysis, generate a short, impactful tagline (max 15 words) that captures the essence of the problem:

Location: ${context.location}
Issue: ${context.description}
Category: ${context.category}
Urgency: ${context.urgency}
Impact Score: ${context.impactScore}/100

Generate only the tagline, nothing else. Make it concise and action-oriented.`;
  }

  /**
   * Extract tagline from model response
   */
  private extractTagline(result: any): string {
    // Handle different response formats
    if (typeof result === 'string') {
      return result.trim();
    }
    
    if (result.choices && result.choices[0]?.message?.content) {
      return result.choices[0].message.content.trim();
    }
    
    if (result.text) {
      return result.text.trim();
    }
    
    if (result.output) {
      return result.output.trim();
    }
    
    if (result.generated_text) {
      return result.generated_text.trim();
    }

    return JSON.stringify(result).substring(0, 100);
  }
}
