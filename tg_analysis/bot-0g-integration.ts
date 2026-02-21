/**
 * 0G Compute Integration for Telegram Bot
 * 
 * This module enhances photo analysis with AI-generated taglines
 * using 0G Compute's free models before creating DAO proposals.
 */

import { AnalysisEnhancer } from './enhance-analysis-with-0g';
import { ZGComputeConfig } from '../zero-gravity/compute/tagline-generator';
import { elizaLogger } from '@elizaos/core';
import axios from 'axios';

export class Bot0GIntegration {
  private enhancer: AnalysisEnhancer | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize 0G Compute integration
   */
  private initialize() {
    try {
      // Check if 0G Compute is configured
      const config: ZGComputeConfig = {
        privateKey: process.env.ZG_COMPUTE_PRIVATE_KEY || process.env.PRIVATE_KEY || '',
        rpcUrl: process.env.ZG_COMPUTE_RPC_URL || 'https://evmrpc-testnet.0g.ai',
        model: 'qwen-2.5-7b-instruct' // 0G's testnet free model
      };

      if (config.privateKey && config.privateKey !== '') {
        this.enhancer = new AnalysisEnhancer(config);
        this.enabled = true;
        elizaLogger.info('[0G Integration] ✅ 0G Compute integration enabled');
        elizaLogger.info('[0G Integration] Using model: qwen-2.5-7b-instruct (testnet)');
      } else {
        elizaLogger.warn('[0G Integration] ⚠️ 0G Compute not configured (missing private key)');
        elizaLogger.warn('[0G Integration] Set ZG_COMPUTE_PRIVATE_KEY or PRIVATE_KEY in .env');
        this.enabled = false;
      }
    } catch (error) {
      elizaLogger.error('[0G Integration] Failed to initialize:', error);
      this.enabled = false;
    }
  }

  /**
   * Check if 0G integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enhance analysis with 0G Compute-generated tagline
   * 
   * This fetches the analysis from IPFS, enhances it with a tagline,
   * and returns the enhanced analysis data.
   */
  async enhanceAnalysisFromIPFS(analysisUrl: string): Promise<any> {
    if (!this.enabled || !this.enhancer) {
      elizaLogger.warn('[0G Integration] Enhancement skipped - not enabled');
      // Return original analysis without enhancement
      const response = await axios.get(analysisUrl);
      return response.data;
    }

    try {
      elizaLogger.info('[0G Integration] Fetching analysis from IPFS...');
      
      // Fetch the original analysis
      const response = await axios.get(analysisUrl);
      const analysisData = response.data;

      elizaLogger.info('[0G Integration] Enhancing with 0G Compute...');
      
      // Enhance with 0G Compute tagline
      const enhancedData = await this.enhancer.enhanceAnalysisData(analysisData);

      elizaLogger.info('[0G Integration] ✅ Analysis enhanced successfully');
      elizaLogger.info(`[0G Integration] Tagline: "${enhancedData.zgComputeEnhancement?.tagline}"`);

      return enhancedData;
    } catch (error: any) {
      elizaLogger.error('[0G Integration] Enhancement failed:', error);
      
      // Fallback: return original analysis
      elizaLogger.warn('[0G Integration] Falling back to original analysis');
      const response = await axios.get(analysisUrl);
      return response.data;
    }
  }

  /**
   * Format proposal description with 0G enhancement
   */
  formatProposalWithEnhancement(analysisData: any, proposalData: any): string {
    const location = [
      analysisData.metadata?.location?.city,
      analysisData.metadata?.location?.state,
      analysisData.metadata?.location?.country
    ].filter(Boolean).join(", ");

    const submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Check if we have 0G enhancement
    const hasEnhancement = analysisData.zgComputeEnhancement?.tagline;
    const tagline = hasEnhancement ? analysisData.zgComputeEnhancement.tagline : '';

    let description = `Impact Initiative Proposal

Submission ID: ${submissionId}
Location: ${location}
Coordinates: ${analysisData.metadata?.location?.coordinates?.lat}, ${analysisData.metadata?.location?.coordinates?.lng}
Impact Score: ${analysisData.impactAssessment?.score || 'N/A'}
Urgency: ${analysisData.impactAssessment?.urgency || 'N/A'}
Category: ${analysisData.impactAssessment?.category || 'N/A'}`;

    // Add 0G-generated tagline if available
    if (hasEnhancement) {
      description += `

⚡ AI-Generated Summary (powered by 0G Compute):
"${tagline}"`;
    }

    description += `

Description:
${analysisData.analysis?.description || 'No description available'}

Current Conditions:
- Weather: ${analysisData.context?.weather?.conditions || 'N/A'} (${analysisData.context?.weather?.temperature || 'N/A'}°C)

Estimated Impact:
${analysisData.impactAssessment?.estimatedImpact || 'To be assessed by DAO members'}

Recommended Actions:
${(analysisData.impactAssessment?.recommendedActions || []).map((action: string) => `- ${action}`).join('\n')}

Evidence & Verification:
- Image IPFS: ${proposalData.imageUrl}
- Analysis IPFS: ${proposalData.analysisUrl}
- Confidence Score: ${analysisData.analysis?.confidence || 'N/A'}%
- Timestamp: ${analysisData.metadata?.timestamp || new Date().toISOString()}`;

    // Add 0G metadata if available
    if (hasEnhancement) {
      description += `

⚡ 0G Network Integration:
- Compute Model: ${analysisData.zgComputeEnhancement.model}
- Processing Time: ${analysisData.zgComputeEnhancement.executionTime}ms
- Provider Address: ${analysisData.zgComputeEnhancement.providerAddress}
- Network: ${analysisData.zgComputeEnhancement.provider}`;
    }

    description += `

This proposal has been automatically generated from verified analysis data.
All information is stored on IPFS and can be independently verified.`;

    return description.trim();
  }
}

// Export singleton instance
export const bot0GIntegration = new Bot0GIntegration();
