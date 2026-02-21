import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface IPFSAnalysis {
  metadata: {
    timestamp: string;
    location: {
      coordinates: {
        lat: number;
        lng: number;
      };
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    };
  };
  analysis: {
    description: string;
    categories?: string[];
    tags?: string[];
    confidence: number;
  };
  context: {
    weather?: {
      temperature?: number;
      conditions?: string;
    };
    news?: {
      relevantArticles?: Array<{
        title: string;
        url: string;
      }>;
    };
  };
  impactAssessment: {
    score: number;
    category: string;
    urgency: string;
    estimatedImpact: string;
    recommendedActions: string[];
  };
}

async function fetchFromIPFS(cid: string): Promise<any> {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch from IPFS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validateAnalysisData(data: any): IPFSAnalysis {
  if (!data) {
    throw new Error('No data received from analysis file');
  }

  const errors: string[] = [];

  if (!data.metadata?.timestamp) {
    errors.push('Missing required field: metadata.timestamp');
  }

  if (!data.metadata?.location?.coordinates) {
    errors.push('Missing required field: metadata.location.coordinates');
  } else {
    const { lat, lng } = data.metadata.location.coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push('Invalid coordinates: lat and lng must be numbers');
    }
  }

  if (!data.analysis?.description) {
    errors.push('Missing required field: analysis.description');
  }

  if (!data.impactAssessment?.score) {
    errors.push('Missing required field: impactAssessment.score');
  }

  if (errors.length > 0) {
    throw new Error(`Analysis data validation failed:\n${errors.join('\n')}`);
  }

  return data as IPFSAnalysis;
}

function formatProposalDescription(analysisData: IPFSAnalysis, imageCID: string, analysisCID: string): string {
  const location = [
    analysisData.metadata.location.city,
    analysisData.metadata.location.state,
    analysisData.metadata.location.country
  ].filter(Boolean).join(", ");

  // Add a unique submission ID to ensure uniqueness
  const submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return `
Impact Initiative Proposal

Submission ID: ${submissionId}
Location: ${location}
Coordinates: ${analysisData.metadata.location.coordinates.lat}, ${analysisData.metadata.location.coordinates.lng}
Impact Score: ${analysisData.impactAssessment.score}
Urgency: ${analysisData.impactAssessment.urgency}
Category: ${analysisData.impactAssessment.category}

Description:
${analysisData.analysis.description}

Current Conditions:
- Weather: ${analysisData.context.weather?.conditions || 'N/A'} (${analysisData.context.weather?.temperature || 'N/A'}°C)

Estimated Impact:
${analysisData.impactAssessment.estimatedImpact}

Recommended Actions:
${analysisData.impactAssessment.recommendedActions.map(action => `- ${action}`).join('\n')}

Evidence & Verification:
- Image IPFS: https://gateway.pinata.cloud/ipfs/${imageCID}
- Analysis IPFS: https://gateway.pinata.cloud/ipfs/${analysisCID}
- Confidence Score: ${analysisData.analysis.confidence}%
- Timestamp: ${analysisData.metadata.timestamp}

This proposal has been automatically generated from verified analysis data.
All information is stored on IPFS and can be independently verified.
  `.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageCID, analysisCID } = body;

    if (!imageCID || !analysisCID) {
      return NextResponse.json(
        { error: 'Both imageCID and analysisCID are required' },
        { status: 400 }
      );
    }

    console.log('Fetching analysis from IPFS:', analysisCID);
    const analysisData = await fetchFromIPFS(analysisCID);

    console.log('Validating analysis data...');
    const validatedData = validateAnalysisData(analysisData);

    console.log('Formatting proposal description...');
    const description = formatProposalDescription(validatedData, imageCID, analysisCID);

    return NextResponse.json({
      success: true,
      description,
      analysisData: validatedData
    });

  } catch (error) {
    console.error('Error preparing proposal:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to prepare proposal',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
