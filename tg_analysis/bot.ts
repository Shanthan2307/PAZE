import TelegramBot from 'node-telegram-bot-api';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { elizaLogger } from '@elizaos/core';
import { PhotoAnalyzer } from './analyze-photo';
import { ImageAnalysisProvider, LocationProvider, WeatherProvider, NewsProvider } from './providers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Add global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  elizaLogger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  elizaLogger.error('Uncaught Exception:', error);
  process.exit(1);
});

interface VideoAnalysisResult {
  success: boolean;
  imageUrl?: string;
  analysisUrl?: string;
  message: string;
  error?: string;
}

export class PazeTelegramBot {
  private bot: TelegramBot;
  private tempDir: string;
  private token: string;
  private analyzer: PhotoAnalyzer;
  private framePathMap: Map<string, string> = new Map();
  private proposalDataMap: Map<string, any> = new Map();

  constructor(token: string) {
    this.token = token;
    this.bot = new TelegramBot(token, { polling: true });
    this.tempDir = path.join(__dirname, 'temp', 'telegram-videos');
    
    // Initialize providers
    const providers = {
      imageAnalysis: new ImageAnalysisProvider(process.env.ANTHROPIC_API_KEY!),
      location: new LocationProvider(),
      weather: new WeatherProvider(),
      news: new NewsProvider()
    };
    
    this.analyzer = new PhotoAnalyzer(providers);
    this.setupHandlers();
  }

  private setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '🤖 Welcome to Paze - People\'s Waze for Infrastructure!\n\n' +
        'Report infrastructure damage and help your community:\n\n' +
        '1. 🎥 Send a video of the damage\n' +
        '2. 📝 Add a caption describing what to look for\n' +
        '3. 📸 Bot extracts the best frame\n' +
        '4. 🧠 Click "Analyze" to process with AI\n' +
        '5. ☁️ Get IPFS URLs\n' +
        '6. 🗳️ Click "Create DAO Proposal"\n\n' +
        '🔧 Commands:\n' +
        '/help - Detailed instructions\n' +
        '/retry - Retry proposal creation\n' +
        '/status - Check analysis status\n\n' +
        'Example: Send a video with caption:\n' +
        '"Cracked footpath on Main Street"'
      );
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '📖 How to use Paze Bot:\n\n' +
        '1. Send a video (under 20MB)\n' +
        '2. Add a caption describing the issue\n' +
        '3. Wait for frame extraction\n' +
        '4. Bot extracts the frame\n' +
        '5. Click "Analyze" button\n' +
        '6. Get IPFS URLs (30-60 seconds)\n\n' +
        '💡 If video is too large, compress it:\n' +
        'ffmpeg -i input.mp4 -vcodec h264 -crf 28 output.mp4\n\n' +
        '🔄 Commands:\n' +
        '/start - Start the bot\n' +
        '/help - Show this help message\n' +
        '/retry - Retry last failed proposal creation\n' +
        '/status - Check bot status'
      );
    });

    // Handle /retry command
    this.bot.onText(/\/retry/, async (msg) => {
      const chatId = msg.chat.id;
      const proposalData = this.proposalDataMap.get(chatId.toString());

      if (!proposalData) {
        await this.bot.sendMessage(
          chatId,
          '❌ No proposal data found.\n\n' +
          'Please analyze a photo first before creating a proposal.'
        );
        return;
      }

      await this.bot.sendMessage(
        chatId,
        '🔄 Retrying proposal creation...'
      );

      // Simulate callback query for retry
      const fakeQuery: any = {
        id: Date.now().toString(),
        from: msg.from,
        message: msg,
        chat_instance: chatId.toString(),
        data: 'create_proposal'
      };

      await this.handleCreateProposal(fakeQuery);
    });

    // Handle /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const proposalData = this.proposalDataMap.get(chatId.toString());

      let statusMessage = '📊 Bot Status\n\n';
      statusMessage += '✅ Bot is running\n';
      statusMessage += `📋 Stored proposals: ${this.proposalDataMap.size}\n`;
      
      if (proposalData) {
        statusMessage += '\n💾 Your last analysis:\n';
        statusMessage += `📸 Image: ${proposalData.imageCID.substring(0, 20)}...\n`;
        statusMessage += `📄 Analysis: ${proposalData.analysisCID.substring(0, 20)}...\n`;
        statusMessage += '\n✅ Ready to create proposal!';
      } else {
        statusMessage += '\n📭 No analysis data stored\n';
        statusMessage += 'Send a video to get started!';
      }

      await this.bot.sendMessage(chatId, statusMessage);
    });

    // Handle /status command (moved above, removing duplicate)
    this.bot.onText(/\/status_old/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        '✅ Bot is online and ready!\n\n' +
        'Services:\n' +
        '• Video Analysis: ✅ Ready\n' +
        '• Photo Analyst: ✅ Ready\n' +
        '• IPFS Upload: ✅ Ready\n' +
        '• Weather API: ✅ Ready\n' +
        '• News API: ✅ Ready'
      );
    });

    // Handle video messages
    this.bot.on('video', async (msg) => {
      await this.handleVideo(msg);
    });

    // Handle document messages (videos sent as files)
    this.bot.on('document', async (msg) => {
      if (msg.document?.mime_type?.startsWith('video/')) {
        await this.handleVideo(msg);
      }
    });

    // Handle callback queries (button clicks)
    this.bot.on('callback_query', async (query) => {
      await this.handleCallback(query);
    });

    elizaLogger.info('Telegram bot handlers set up');
  }

  private async handleVideo(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const video = msg.video || msg.document;
    const caption = msg.caption || '';

    if (!video) {
      await this.bot.sendMessage(chatId, '❌ No video found in message');
      return;
    }

    if (!caption) {
      await this.bot.sendMessage(
        chatId,
        '⚠️ Please add a caption describing what damage to look for.\n\n' +
        'Example: "Cracked footpath" or "Broken sidewalk"'
      );
      return;
    }

    try {
      const statusMsg = await this.bot.sendMessage(
        chatId,
        '🔄 Processing your video...\n\n' +
        `📹 Video received\n` +
        `🔍 Looking for: "${caption}"\n\n` +
        'This may take 30-60 seconds...'
      );

      // Download video
      await this.bot.editMessageText(
        '⬇️ Downloading video...',
        { chat_id: chatId, message_id: statusMsg.message_id }
      );

      const videoPath = await this.downloadVideo(video.file_id, chatId);

      // Extract frame
      await this.bot.editMessageText(
        '🎬 Extracting frame from video...\n' +
        `🔍 Looking for: "${caption}"`,
        { chat_id: chatId, message_id: statusMsg.message_id }
      );

      const framePath = await this.extractFrame(videoPath, caption);

      // Frame extracted - send it with analyze button
      await this.bot.editMessageText(
        '✅ Frame extracted successfully!\n\n' +
        `🔍 Found: "${caption}"\n\n` +
        'Click "Analyze" to process with AI and upload to IPFS.',
        { chat_id: chatId, message_id: statusMsg.message_id }
      );

      // Generate short ID for callback_data
      const frameId = `${chatId}-${Date.now()}`;
      this.framePathMap.set(frameId, framePath);

      // Send the extracted frame with analyze button
      await this.bot.sendPhoto(chatId, framePath, {
        caption: `Extracted frame: ${caption}`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🧠 Analyze',
              callback_data: `analyze:${frameId}`
            }
          ]]
        }
      });

      // Cleanup video (keep frame for analysis)
      await fs.unlink(videoPath).catch(() => {});

    } catch (error: any) {
      elizaLogger.error('Error handling video:', error);
      
      let errorMessage = '❌ Error processing video:\n\n';
      
      if (error.message?.includes('too large') || error.message?.includes('20MB')) {
        errorMessage += '📹 Video is too large!\n\n' +
                       '⚠️ Telegram Bot API has a 20MB hard limit.\n\n' +
                       '💡 Solutions:\n\n' +
                       '1️⃣ COMPRESS (recommended):\n' +
                       'ffmpeg -i input.mp4 -vcodec h264 -crf 28 output.mp4\n\n' +
                       '2️⃣ TRIM to shorter clip:\n' +
                       'ffmpeg -i input.mp4 -t 30 -c copy output.mp4\n\n' +
                       '3️⃣ Record shorter video (under 1 minute)';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      await this.bot.sendMessage(chatId, errorMessage);
    }
  }

  private async handleCallback(query: TelegramBot.CallbackQuery) {
    const chatId = query.message!.chat.id;
    const data = query.data!;

    if (data.startsWith('analyze:')) {
      const frameId = data.replace('analyze:', '');
      const framePath = this.framePathMap.get(frameId);

      if (!framePath) {
        await this.bot.answerCallbackQuery(query.id, {
          text: '❌ Frame not found. Please send the video again.',
          show_alert: true
        });
        return;
      }

      try {
        await this.bot.answerCallbackQuery(query.id, {
          text: '🔄 Starting analysis...'
        });

        const statusMsg = await this.bot.sendMessage(
          chatId,
          '🧠 Analyzing photo...\n\n' +
          'This may take 30-60 seconds...\n\n' +
          '• Extracting metadata\n' +
          '• Analyzing with Claude Vision\n' +
          '• Getting weather data\n' +
          '• Getting news data\n' +
          '• Uploading to IPFS'
        );

        // Analyze the photo
        const result = await this.analyzer.analyzePhoto(framePath);

        if (result.success) {
          // Store the analysis data for proposal creation
          const proposalData = {
            imageUrl: result.data.imageAnalysis.storage.imageUrl,
            analysisUrl: result.data.imageAnalysis.storage.analysisUrl,
            imageCID: result.data.imageAnalysis.storage.imageUrl.split('/ipfs/')[1],
            analysisCID: result.data.imageAnalysis.storage.analysisUrl.split('/ipfs/')[1]
          };
          
          // Store in memory for callback
          this.proposalDataMap.set(chatId.toString(), proposalData);

          await this.bot.editMessageText(
            '✅ Analysis complete!\n\n' +
            '📸 Image URL:\n' +
            `${result.data.imageAnalysis.storage.imageUrl}\n\n` +
            '📄 Analysis URL:\n' +
            `${result.data.imageAnalysis.storage.analysisUrl}\n\n` +
            '🎯 Ready to create DAO proposal!',
            { 
              chat_id: chatId, 
              message_id: statusMsg.message_id,
              reply_markup: {
                inline_keyboard: [[
                  { text: '🗳️ Create DAO Proposal', callback_data: 'create_proposal' }
                ]]
              }
            }
          );

          // Cleanup frame
          this.framePathMap.delete(frameId);
          await fs.unlink(framePath).catch(() => {});
        } else {
          await this.bot.editMessageText(
            '❌ Analysis failed. Please try again.',
            { chat_id: chatId, message_id: statusMsg.message_id }
          );
        }
      } catch (error: any) {
        elizaLogger.error('Error analyzing photo:', error);
        await this.bot.sendMessage(
          chatId,
          `❌ Analysis failed:\n${error.message}`
        );
      }
    } else if (data === 'create_proposal') {
      // Handle DAO proposal creation
      await this.handleCreateProposal(query);
    }
  }

  private async handleCreateProposal(query: TelegramBot.CallbackQuery) {
    const chatId = query.message!.chat.id;
    const proposalData = this.proposalDataMap.get(chatId.toString());

    if (!proposalData) {
      await this.bot.answerCallbackQuery(query.id, {
        text: '❌ Proposal data not found. Please analyze a photo first.',
        show_alert: true
      });
      return;
    }

    try {
      await this.bot.answerCallbackQuery(query.id, {
        text: '🔄 Creating DAO proposal...'
      });

      const statusMsg = await this.bot.sendMessage(
        chatId,
        '🗳️ Creating DAO proposal...\n\n' +
        'This may take a few seconds...'
      );

      // Call the impact agent to create proposal
      const { ethers } = await import('ethers');
      
      const contractAddress = '0x033480cD0519B7e5b2AAcd64F7B5C018FbeEC20A';
      const contractABI = [
        "function createProposal(string calldata description) external returns (bytes32)",
        "event ProposalCreated(bytes32 indexed proposalId, string description, uint256 deadline)",
        "function isMember(address account) external view returns (bool)",
        "function joinDAO() external payable",
        "function members(address) external view returns (bool)"
      ];

      // Fetch analysis data from IPFS
      const axios = (await import('axios')).default;
      const analysisResponse = await axios.get(proposalData.analysisUrl);
      const analysisData = analysisResponse.data;

      // Format proposal description
      const location = [
        analysisData.metadata?.location?.city,
        analysisData.metadata?.location?.state,
        analysisData.metadata?.location?.country
      ].filter(Boolean).join(", ");

      const submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const description = `
Impact Initiative Proposal

Submission ID: ${submissionId}
Location: ${location}
Coordinates: ${analysisData.metadata?.location?.coordinates?.lat}, ${analysisData.metadata?.location?.coordinates?.lng}
Impact Score: ${analysisData.impactAssessment?.score || 'N/A'}
Urgency: ${analysisData.impactAssessment?.urgency || 'N/A'}
Category: ${analysisData.impactAssessment?.category || 'N/A'}

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
- Timestamp: ${analysisData.metadata?.timestamp || new Date().toISOString()}

This proposal has been automatically generated from verified analysis data.
All information is stored on IPFS and can be independently verified.
      `.trim();

      // Connect to blockchain and create proposal
      const provider = new ethers.JsonRpcProvider('https://rpc.ab.testnet.adifoundation.ai/');
      const wallet = new ethers.Wallet(process.env.CREATE_PROPOSAL_PRIVATE_KEY!, provider);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet);

      // Check if wallet is a member, if not, join automatically
      try {
        const isMember = await contract.isMember(wallet.address);
        
        if (!isMember) {
          elizaLogger.info('Bot wallet is not a DAO member. Joining DAO...');
          
          await this.bot.editMessageText(
            '🔄 Bot is not a DAO member yet...\n\n' +
            'Joining DAO automatically...',
            { chat_id: chatId, message_id: statusMsg.message_id }
          );
          
          // Join DAO with minimum stake (0.0001 ADI)
          const joinTx = await contract.joinDAO({ value: ethers.parseEther('0.0001') });
          await joinTx.wait();
          
          elizaLogger.info('Successfully joined DAO');
          
          await this.bot.editMessageText(
            '✅ Joined DAO successfully!\n\n' +
            'Now creating proposal...',
            { chat_id: chatId, message_id: statusMsg.message_id }
          );
        }
      } catch (memberCheckError) {
        elizaLogger.warn('Could not check membership, proceeding anyway:', memberCheckError);
      }

      elizaLogger.info('Creating proposal on chain...');
      
      try {
        const tx = await contract.createProposal(description);
        elizaLogger.info(`Transaction sent: ${tx.hash}`);

        await this.bot.editMessageText(
          '⏳ Transaction sent!\n\n' +
          `TX Hash: ${tx.hash}\n\n` +
          'Waiting for confirmation...',
          { chat_id: chatId, message_id: statusMsg.message_id }
        );

        const receipt = await tx.wait();
        elizaLogger.info(`Transaction confirmed in block ${receipt.blockNumber}`);

        // Extract proposal ID from event
        const proposalCreatedEvent = contract.interface.getEvent('ProposalCreated');
        const event = receipt.logs.find(
          (log: any) => log.topics[0] === proposalCreatedEvent!.topicHash
        );

        let proposalId = 'Unknown';
        if (event) {
          const parsedEvent = contract.interface.parseLog({
            topics: event.topics,
            data: event.data
          });
          proposalId = parsedEvent?.args?.[0] || 'Unknown';
        }

        await this.bot.editMessageText(
          '✅ DAO Proposal Created!\n\n' +
          `📋 Proposal ID:\n${proposalId}\n\n` +
          `🔗 Transaction:\n${tx.hash}\n\n` +
          `📦 Block: ${receipt.blockNumber}\n\n` +
          '🎉 Your proposal is now live on the DAO!\n\n' +
          '👉 View at: http://localhost:3001',
          { chat_id: chatId, message_id: statusMsg.message_id }
        );

        // Cleanup
        this.proposalDataMap.delete(chatId.toString());

      } catch (txError: any) {
        // Handle specific transaction errors
        elizaLogger.error('Transaction error:', txError);
        
        let errorMessage = 'Failed to create proposal';
        if (txError.message?.includes('Proposal already exists')) {
          errorMessage = 'This proposal already exists. Each proposal must be unique.';
        } else if (txError.code === 'CALL_EXCEPTION') {
          errorMessage = 'Transaction failed. Possible reasons:\n- Proposal is not unique\n- Network congestion\n- Wait a few seconds and try again';
        } else {
          errorMessage = txError.message || 'Unknown error occurred';
        }
        
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      elizaLogger.error('Error creating proposal:', error);
      await this.bot.sendMessage(
        chatId,
        `❌ Failed to create proposal:\n${error.message}\n\n` +
        '💡 You can try again using:\n' +
        '• Click the button below\n' +
        '• Send /retry command',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🔄 Retry Proposal Creation', callback_data: 'create_proposal' }
            ]]
          }
        }
      );
    }
  }

  private async downloadVideo(fileId: string, chatId: number): Promise<string> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });

      const file = await this.bot.getFile(fileId);
      const fileSizeMB = (file.file_size || 0) / (1024 * 1024);
      elizaLogger.info(`File size: ${fileSizeMB.toFixed(1)}MB`);
      
      if (fileSizeMB > 20) {
        throw new Error('Video is too large for Telegram Bot API (20MB limit)');
      }
      
      const fileUrl = `https://api.telegram.org/file/bot${this.token}/${file.file_path}`;
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `video-${chatId}-${Date.now()}.mp4`;
      const filepath = path.join(this.tempDir, filename);
      await fs.writeFile(filepath, buffer);

      elizaLogger.info('Video downloaded successfully:', filepath);
      return filepath;
    } catch (error: any) {
      elizaLogger.error('Error downloading video:', error);
      throw error;
    }
  }

  private async extractFrame(videoPath: string, description: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(this.tempDir, `frames-${Date.now()}`);
      
      // Python script is in the same directory as bot.ts
      const scriptPath = path.join(__dirname, 'video-frame-extractor.py');
      
      const args = [
        scriptPath,
        '--video', videoPath,
        '--note', description,
        '--fps', '2.0',
        '--topk', '1',
        '--roi', 'none',
        '--out', outputDir
      ];

      const python = spawn('python3', args);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', async (code) => {
        if (code !== 0) {
          elizaLogger.error('Frame extraction failed:', stderr);
          reject(new Error(`Frame extraction failed: ${stderr}`));
          return;
        }

        try {
          const reportPath = path.join(outputDir, 'report.json');
          const reportContent = await fs.readFile(reportPath, 'utf-8');
          const report = JSON.parse(reportContent);
          
          const snapshotPath = report.best.snapshot_path;
          elizaLogger.info('Frame extracted:', snapshotPath);
          resolve(snapshotPath);
        } catch (error) {
          reject(new Error('Failed to read extraction report'));
        }
      });

      python.on('error', (error) => {
        elizaLogger.error('Failed to start Python:', error);
        reject(new Error('Failed to start frame extraction'));
      });
    });
  }

  async start() {
    elizaLogger.info('Paze Telegram Bot started');
    elizaLogger.info('Bot: @Paze2026Bot');
    elizaLogger.info('Send videos to analyze infrastructure damage');
  }

  async stop() {
    await this.bot.stopPolling();
    elizaLogger.info('Telegram bot stopped');
  }
}

// Main entry point
async function main() {
  try {
    elizaLogger.info('Checking environment variables...');
    
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!telegramToken) {
      throw new Error(
        'TELEGRAM_BOT_TOKEN not found in environment variables.\n' +
        'Get a token from @BotFather on Telegram and add it to .env:\n' +
        'TELEGRAM_BOT_TOKEN=your_token_here'
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    if (!process.env.PINATA_JWT && (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET)) {
      throw new Error('Pinata credentials not found in environment variables');
    }

    elizaLogger.info('Starting Paze Telegram Bot...');
    elizaLogger.info('Telegram token:', telegramToken.substring(0, 10) + '...');

    const bot = new PazeTelegramBot(telegramToken);
    await bot.start();

    elizaLogger.info('✅ Paze Telegram Bot is running!');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      elizaLogger.info('Shutting down...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      elizaLogger.info('Shutting down...');
      await bot.stop();
      process.exit(0);
    });

  } catch (error: any) {
    elizaLogger.error('Failed to start Telegram bot:', error);
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  elizaLogger.error('Unhandled error in main:', error);
  console.error('\n❌ Fatal error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});
