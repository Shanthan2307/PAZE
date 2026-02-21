import { promises as fs } from 'fs';
import path from 'path';
import { TaglineGenerator, ZGComputeConfig } from '../zero-gravity/compute/tagline-generator';
import { elizaLogger } from '@elizaos/core';

export interface EnhancedAnalysis {
  success: boolean;
  enhancedAnalysisPath?: string;
  tagline?: string;
  error?: string;
  zgComputeMetadata?: {
    executionTime: number;
    nodeId: string;
    model: string;
  };
}

export class AnalysisEnhancer {
  private taglineGenerator: TaglineGenerator;

  constructor(config: ZGComputeConfig) {
    this.taglineGenerator = new TaglineGenerator(config);
  }

  /**
   * Enhance analysis JSON with 0G Compute-generated tagline
   */
  async enhanceAnalysis(analysisPath: string): Promise<EnhancedAnalysis> {
    try {
      elizaLogger.info('[0G Enhancement] Reading analysis file...');
      
      // Read the original analysis
      const analysisContent = await fs.readFile(analysisPath, 'utf-8');
      const analysisData = JSON.parse(analysisContent);

      elizaLogger.info('[0G Enhancement] Generating tagline with 0G Compute...');
      
      // Generate tagline using 0G Compute
      const taglineResult = await this.taglineGenerator.generateTagline(analysisData);

      if (!taglineResult.success || !taglineResult.tagline) {
        throw new Error(taglineResult.error || 'Failed to generate tagline');
      }

      elizaLogger.info('[0G Enhancement] Tagline generated:', taglineResult.tagline);

      // Add the tagline to the analysis
      const enhancedAnalysis = {
        ...analysisData,
        zgComputeEnhancement: {
          tagline: taglineResult.tagline,
          generatedAt: new Date().toISOString(),
          model: 'qwen-2.5-7b-instruct',
          executionTime: taglineResult.executionTime,
          providerAddress: taglineResult.providerAddress,
          provider: '0G Compute Network',
          note: taglineResult.error || 'Generated using 0G Compute testnet'
        }
      };

      // Save the enhanced analysis
      const enhancedPath = analysisPath.replace('.json', '-enhanced.json');
      await fs.writeFile(
        enhancedPath,
        JSON.stringify(enhancedAnalysis, null, 2),
        'utf-8'
      );

      elizaLogger.info('[0G Enhancement] Enhanced analysis saved:', enhancedPath);

      return {
        success: true,
        enhancedAnalysisPath: enhancedPath,
        tagline: taglineResult.tagline,
        zgComputeMetadata: {
          executionTime: taglineResult.executionTime || 0,
          nodeId: taglineResult.nodeId || 'unknown',
          model: 'llama-3-8b-instruct'
        }
      };
    } catch (error: any) {
      elizaLogger.error('[0G Enhancement] Error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Enhance analysis data directly (without file I/O)
   */
  async enhanceAnalysisData(analysisData: any): Promise<any> {
    elizaLogger.info('[0G Enhancement] Generating tagline with 0G Compute...');
    
    const taglineResult = await this.taglineGenerator.generateTagline(analysisData);

    if (!taglineResult.success || !taglineResult.tagline) {
      throw new Error(taglineResult.error || 'Failed to generate tagline');
    }

    elizaLogger.info('[0G Enhancement] Tagline generated:', taglineResult.tagline);

    // Return enhanced analysis with tagline
    return {
      ...analysisData,
      zgComputeEnhancement: {
        tagline: taglineResult.tagline,
        generatedAt: new Date().toISOString(),
        model: 'qwen-2.5-7b-instruct',
        executionTime: taglineResult.executionTime,
        providerAddress: taglineResult.providerAddress,
        provider: '0G Compute Network',
        note: taglineResult.error || 'Generated using 0G Compute testnet'
      }
    };
  }
}
