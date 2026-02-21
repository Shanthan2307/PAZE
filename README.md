# 🌍 PAZE - Decentralized Social Impact Platform

PAZE is a blockchain-based decentralized autonomous organization (DAO) that enables community-driven decision-making for social impact initiatives. Built on the ADI Testnet, PAZE combines AI-powered analysis with prediction markets to create transparent, verifiable proposals for addressing real-world issues.

## 🎯 Overview

PAZE transforms social impact initiatives through:

- **AI-Powered Analysis**: Automated analysis of photos and data to identify community issues
- **Decentralized Governance**: Community members vote on proposals using blockchain technology
- **Prediction Markets**: Market-based mechanisms to forecast proposal outcomes
- **IPFS Storage**: Decentralized storage of evidence and analysis data
- **Transparent Execution**: On-chain verification of all decisions and actions

## ✨ Key Features

### 🗳️ DAO Governance
- Stake-based membership (0.0001 ADI minimum)
- Democratic voting on proposals (7-day voting period)
- Quorum requirements for proposal execution
- Pre-configured member support

### 📊 Proposal System
- Rich metadata including location, severity, and issue type
- IPFS-backed evidence storage
- Automated proposal creation from AI analysis
- Status tracking (Active, Executed, Rejected, Expired)

### 🔮 Prediction Markets
- Market-based outcome forecasting
- Escrow system for market funds
- Verification and resolution mechanisms
- Integration with DAO proposals

### 🤖 AI Integration
- Automated photo analysis
- Impact assessment scoring
- Confidence-based verification
- Telegram bot integration for data collection

## 🏗️ Architecture

### Smart Contracts

#### SimpleDAO.sol
Basic DAO implementation with:
- Member management (join/leave)
- Proposal creation and voting
- Execution logic with quorum requirements

#### PredictionMarketDAO.sol
Advanced DAO with prediction market integration:
- Enhanced metadata (location, severity, issue type)
- Configurable voting and resolution periods
- Market contract integration
- Comprehensive proposal tracking

#### MarketEscrow.sol
Escrow system for prediction markets:
- Secure fund management
- Automated payouts
- Market resolution support

### Frontend Stack

- **Framework**: Next.js 14 with React 18
- **Blockchain**: ethers.js v6, wagmi, viem
- **Wallet**: RainbowKit for wallet connections
- **Styling**: Tailwind CSS with custom dark theme
- **State**: TanStack React Query

### Backend Services

- **AI Agent**: Automated proposal creation from analysis files
- **Telegram Bot**: Data collection and community engagement
- **IPFS Integration**: Pinata for decentralized storage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- ADI Testnet tokens (for gas and staking)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd doa_adi

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

Create a `.env` file in the root directory:

```bash
# Network Configuration
DAO_CHAIN_RPC_URL=https://rpc.ab.testnet.adifoundation.ai/
DAO_CHAIN_ID=99999

# Contract Addresses
DAO_CONTRACT_ADDRESS=0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A

# Deployment Wallet
CREATE_PROPOSAL_PRIVATE_KEY=your_private_key_here

# Pinata (IPFS)
PINATA_JWT=your_pinata_jwt
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_api_secret
```

### Running the Application

#### Start the Frontend

```bash
npm run dev
```

Visit http://localhost:3000 to access the PAZE interface.

#### Run the Impact Agent

```bash
npm run impact-agent
```

The agent will:
1. Scan `details/analysis/` for new analysis files
2. Upload evidence to IPFS via Pinata
3. Create proposals on-chain
4. Track processed files in `processed-files.json`

#### Deploy Contracts

```bash
npm run compile
npm run deploy
```

## 📱 Using PAZE

### Joining the DAO

1. Connect your wallet to the PAZE frontend
2. Navigate to the "Home" tab
3. Click "Join DAO" and stake 0.0001 ADI
4. Confirm the transaction in your wallet

### Creating Proposals

#### Via AI Agent

1. Add analysis JSON files to `details/analysis/`
2. Run `npm run impact-agent`
3. Proposals are automatically created with IPFS links

#### Manual Creation

Use the smart contract directly or through the frontend interface (coming soon).

### Voting on Proposals

1. Navigate to the "Voting" tab
2. Browse active proposals
3. Click "Vote For" or "Vote Against"
4. Confirm the transaction
5. Wait for the 7-day voting period to end

### Executing Proposals

1. After voting ends, check if the proposal passed
2. Click "Execute Proposal" if approved
3. The proposal status updates to "Executed"

## 🎨 UI/UX

### Dark Theme Design

PAZE features a professional dark theme inspired by modern social platforms:

- **Background**: `#0f1419` (dark blue-black)
- **Sidebar**: `#16181c` (slightly lighter)
- **Cards**: `#16181c` with `#2f3336` borders
- **Text**: `#e7e9ea` (primary), `#71767b` (secondary)
- **Accent**: `#1d9bf0` (blue)

### Navigation

- **Sidebar**: Home and Voting tabs with network info
- **Main Content**: Sticky header with wallet connection
- **Responsive**: Optimized for desktop, tablet, and mobile

### Proposal Cards

Each proposal displays:
- Status badge (Active, Executed, etc.)
- Urgency level (High, Medium, Low)
- Location and category
- Impact score
- Voting progress bar
- IPFS link to full analysis
- Expandable details

## 🔧 Development

### Project Structure

```
doa_adi/
├── contracts/              # Solidity smart contracts
│   ├── SimpleDAO.sol
│   ├── PredictionMarketDAO.sol
│   ├── MarketEscrow.sol
│   └── ...
├── frontend/               # Next.js frontend
│   ├── app/
│   ├── components/
│   └── lib/
├── scripts/                # Deployment and utility scripts
├── src/                    # Backend services
│   ├── social-impact/      # AI agent
│   └── run-impact-agent.ts
├── details/                # Analysis data
│   ├── analysis/           # JSON analysis files
│   └── photos/             # Original photos
├── test/                   # Contract tests
└── tg_analysis/            # Telegram bot

```

### Available Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to ADI Testnet
npm run deploy

# Start frontend development server
npm run dev

# Build frontend for production
npm run build

# Run impact agent
npm run impact-agent

# Check membership status
npm run check-membership
```

### Testing

```bash
# Run all tests
npm run test

# Test specific contract
npx hardhat test test/TarsDAO.test.ts
```

## 🌐 Network Information

### ADI Testnet

- **Chain ID**: 99999
- **RPC URL**: https://rpc.ab.testnet.adifoundation.ai/
- **Explorer**: https://explorer.ab.testnet.adifoundation.ai/
- **Faucet**: (Contact ADI team for testnet tokens)

### Deployed Contracts

- **PredictionMarketDAO**: `0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A`
- **Network**: ADI Testnet (Chain ID: 99999)

## 📚 Documentation

Additional documentation available in the repository:

- `IMPACT_AGENT_README.md` - AI agent setup and usage
- `PAZE_REBRANDING.md` - UI/UX design details
- `PREDICTION_MARKET_COMPLETE.md` - Prediction market integration
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `DEPLOYMENT_COMPLETE.md` - Deployment instructions

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Frontend**: http://localhost:3000 (local development)
- **Block Explorer**: https://explorer.ab.testnet.adifoundation.ai/
- **IPFS Gateway**: https://gateway.pinata.cloud/ipfs/

## 💡 Use Cases

### Community Infrastructure
- Report and track infrastructure issues
- Vote on repair priorities
- Verify completion through prediction markets

### Environmental Monitoring
- Document environmental concerns
- Coordinate community responses
- Track impact over time

### Social Impact Initiatives
- Propose community programs
- Allocate resources democratically
- Measure outcomes transparently

## 🛠️ Troubleshooting

### Common Issues

**"Not a member" error**
- Solution: Join the DAO first by staking 0.0001 ADI

**"Insufficient funds" error**
- Solution: Ensure you have enough ADI for gas fees and staking

**"Voting period ended" error**
- Solution: You can only vote during the 7-day voting period

**Frontend not connecting to wallet**
- Solution: Ensure MetaMask is installed and connected to ADI Testnet

### Getting Help

- Check existing documentation in the repository
- Review contract events on the block explorer
- Verify your `.env` configuration
- Ensure you're connected to the correct network

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Enhanced prediction market features
- [ ] Multi-chain deployment
- [ ] Advanced analytics dashboard
- [ ] Community reputation system
- [ ] Automated impact verification
- [ ] Integration with more AI models

## 👥 Team

PAZE is built by a community of developers, designers, and social impact enthusiasts committed to making decentralized governance accessible and effective.

---

**Built with ❤️ for social impact**

*Empowering communities through decentralized decision-making*
