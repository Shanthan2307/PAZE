import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function checkMembership() {
  const contractAddress = '0x1323f3CfE3c34165562a7B5CC16a867A4bBacA9d';
  const userAddress = '0x2B650F7565629b54fc476152e4aCbD9C1A4DEF9B';
  
  const contractABI = [
    "function isMember(address account) external view returns (bool)",
    "function members(address) external view returns (bool)"
  ];

  const provider = new ethers.JsonRpcProvider('https://rpc.ab.testnet.adifoundation.ai/');
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  console.log('Checking membership for:', userAddress);
  console.log('Contract address:', contractAddress);
  console.log('');

  try {
    const isMember = await contract.isMember(userAddress);
    console.log('Is member (via isMember):', isMember);
    
    const memberDirect = await contract.members(userAddress);
    console.log('Is member (via members mapping):', memberDirect);
  } catch (error) {
    console.error('Error checking membership:', error);
  }
}

checkMembership();
