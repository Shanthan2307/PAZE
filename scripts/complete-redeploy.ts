import { ethers } from 'hardhat';
import * as fs from 'fs';
import axios from 'axios';

const PINATA_JWT = process.env.PINATA_JWT!;

async function uploadToPinata(data: any, filename: string): Promise<string> {
  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    {
      pinataContent: data,
      pinataMetadata: { name: filename }
    },
    {
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.IpfsHash;
}

async function main() {
  console.log('🚀 Complete Redeployment Starting...\n');

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ADI\n`);

  // Step 1: Deploy SimpleDAO
  console.log('📝 Step 1: Deploying SimpleDAO...');
  const SimpleDAO = await ethers.getContractFactory('SimpleDAO');
  const dao = await SimpleDAO.deploy();
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  
  console.log(`✅ SimpleDAO deployed: ${daoAddress}\n`);

  // Step 2: Check if already a member, join if not
  console.log('👥 Step 2: Checking DAO Membership...');
  const isMember = await dao.isMember(deployer.address);
  
  if (!isMember) {
    console.log('Joining DAO...');
    const joinTx = await dao.joinDAO({ value: ethers.parseEther('0.0001') });
    await joinTx.wait();
    console.log('✅ Joined DAO\n');
  } else {
    console.log('✅ Already a member (pre-configured)\n');
  }

  // Step 3: Create Proposal 1
  console.log('📋 Step 3: Creating Proposal 1 - Denver Sidewalk Repair...');
  
  const proposal1Data = {
    id: `PROP_${Date.now()}_001`,
    metadata: {
      timestamp: new Date().toISOString(),
      location: {
        coordinates: { lat: 39.7392, lng: -104.9903 },
        address: 'Bannock Central Plaza, Golden Triangle',
        city: 'Denver',
        state: 'Colorado',
        country: 'United States'
      }
    },
    analysis: {
      description: 'Damaged concrete sidewalk tiles creating pedestrian hazards',
      confidence: 85
    },
    impactAssessment: {
      score: 75,
      category: 'Infrastructure',
      urgency: 'high',
      estimatedImpact: 'Affects 5000+ daily pedestrians'
    }
  };

  const ipfs1 = await uploadToPinata(proposal1Data, 'proposal-denver-sidewalk.json');
  console.log(`IPFS: ${ipfs1}`);

  const desc1 = `Denver Sidewalk Repair Initiative

Location: Denver, Colorado, United States
Coordinates: 39.7392, -104.9903
Category: Infrastructure
Urgency: High
Impact Score: 75/100

Critical sidewalk damage affecting pedestrian safety. Multiple concrete tiles are cracked and lifted, creating trip hazards for over 5,000 daily pedestrians including elderly and disabled residents.

Requested Funding: 5 ADI
Evidence: https://gateway.pinata.cloud/ipfs/${ipfs1}
Confidence: 85%
Powered by 0G Compute & Storage

Submitted: ${new Date().toISOString()}`;

  const tx1 = await dao.createProposal(desc1);
  const receipt1 = await tx1.wait();
  
  const event1 = receipt1?.logs.find((log: any) => {
    try {
      const parsed = dao.interface.parseLog(log);
      return parsed?.name === 'ProposalCreated';
    } catch {
      return false;
    }
  });
  
  let proposalId1 = '';
  if (event1) {
    const parsed = dao.interface.parseLog(event1);
    proposalId1 = parsed?.args[0];
  }
  
  console.log(`✅ Proposal 1 Created: ${proposalId1}`);
  console.log(`   TX: ${tx1.hash}\n`);

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: Create Proposal 2
  console.log('📋 Step 4: Creating Proposal 2 - Boston Pothole Repair...');
  
  const proposal2Data = {
    id: `PROP_${Date.now()}_002`,
    metadata: {
      timestamp: new Date().toISOString(),
      location: {
        coordinates: { lat: 42.3601, lng: -71.0589 },
        address: 'Commonwealth Avenue',
        city: 'Boston',
        state: 'Massachusetts',
        country: 'United States'
      }
    },
    analysis: {
      description: 'Large pothole causing vehicle damage on major thoroughfare',
      confidence: 90
    },
    impactAssessment: {
      score: 82,
      category: 'Infrastructure',
      urgency: 'high',
      estimatedImpact: 'Affects 10,000+ daily vehicles'
    }
  };

  const ipfs2 = await uploadToPinata(proposal2Data, 'proposal-boston-pothole.json');
  console.log(`IPFS: ${ipfs2}`);

  const desc2 = `Boston Pothole Emergency Repair

Location: Boston, Massachusetts, United States
Coordinates: 42.3601, -71.0589
Category: Infrastructure
Urgency: High
Impact Score: 82/100

Large pothole (2ft diameter, 6in deep) on Commonwealth Avenue near Boston University causing vehicle damage and safety hazards. Affects 10,000+ daily vehicles with multiple reports of tire damage.

Requested Funding: 3 ADI
Evidence: https://gateway.pinata.cloud/ipfs/${ipfs2}
Confidence: 90%
Powered by 0G Compute & Storage

Submitted: ${new Date().toISOString()}`;

  const tx2 = await dao.createProposal(desc2);
  const receipt2 = await tx2.wait();
  
  const event2 = receipt2?.logs.find((log: any) => {
    try {
      const parsed = dao.interface.parseLog(log);
      return parsed?.name === 'ProposalCreated';
    } catch {
      return false;
    }
  });
  
  let proposalId2 = '';
  if (event2) {
    const parsed = dao.interface.parseLog(event2);
    proposalId2 = parsed?.args[0];
  }
  
  console.log(`✅ Proposal 2 Created: ${proposalId2}`);
  console.log(`   TX: ${tx2.hash}\n`);

  // Step 5: Update configuration files
  console.log('⚙️  Step 5: Updating Configuration Files...');
  
  // Update root .env
  const envPath = '.env';
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent
    .replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/, `NEXT_PUBLIC_CONTRACT_ADDRESS=${daoAddress}`)
    .replace(/DAO_CONTRACT_ADDRESS=.*/, `DAO_CONTRACT_ADDRESS=${daoAddress}`);
  fs.writeFileSync(envPath, envContent);

  // Update frontend .env.local
  fs.writeFileSync('frontend/.env.local', `NEXT_PUBLIC_CONTRACT_ADDRESS=${daoAddress}\n`);

  // Update tg_analysis .env
  const tgEnvPath = 'tg_analysis/.env';
  let tgEnvContent = fs.readFileSync(tgEnvPath, 'utf8');
  tgEnvContent = tgEnvContent.replace(/DAO_CONTRACT_ADDRESS=.*/, `DAO_CONTRACT_ADDRESS=${daoAddress}`);
  fs.writeFileSync(tgEnvPath, tgEnvContent);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: daoAddress,
    deployer: deployer.address,
    network: 'adiTestnet',
    chainId: '99999',
    deployedAt: new Date().toISOString(),
    proposals: [
      {
        id: proposalId1,
        title: 'Denver Sidewalk Repair',
        ipfs: ipfs1,
        txHash: tx1.hash
      },
      {
        id: proposalId2,
        title: 'Boston Pothole Repair',
        ipfs: ipfs2,
        txHash: tx2.hash
      }
    ]
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log('✅ Configuration updated\n');

  // Summary
  console.log('='.repeat(70));
  console.log('🎉 COMPLETE REDEPLOYMENT SUCCESSFUL!');
  console.log('='.repeat(70));
  console.log(`\n📍 DAO Contract: ${daoAddress}`);
  console.log(`\n📋 Proposals Created:`);
  console.log(`\n   1. ${proposalId1}`);
  console.log(`      Denver Sidewalk Repair`);
  console.log(`      IPFS: ${ipfs1}`);
  console.log(`      TX: ${tx1.hash}`);
  console.log(`\n   2. ${proposalId2}`);
  console.log(`      Boston Pothole Repair`);
  console.log(`      IPFS: ${ipfs2}`);
  console.log(`      TX: ${tx2.hash}`);
  console.log(`\n🌐 View on Explorer:`);
  console.log(`   https://explorer.ab.testnet.adifoundation.ai/address/${daoAddress}`);
  console.log(`\n💻 Frontend: http://localhost:3000`);
  console.log(`   (Restart if already running)`);
  console.log(`\n🤖 Telegram Bot: @Paze2026Bot`);
  console.log(`   (Restart to use new contract)`);
  console.log('='.repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
