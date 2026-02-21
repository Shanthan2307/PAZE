# 0G Compute Integration - Setup Checklist

## Quick Setup (5 Steps)

### ☐ Step 1: Get 0G Credentials

1. Visit https://testnet.0g.ai
2. Create an account
3. Get testnet tokens from faucet
4. Copy your private key

**Time:** 5 minutes

### ☐ Step 2: Configure Environment

Add to `doa_adi/.env`:

```bash
# 0G Compute Configuration
ZG_COMPUTE_RPC_URL=https://rpc-compute-testnet.0g.ai
ZG_COMPUTE_BROKER_URL=https://broker-compute-testnet.0g.ai
ZG_COMPUTE_PRIVATE_KEY=your_private_key_here
ZG_CHAIN_ID=16600

# Compute Settings
ZG_COMPUTE_MAX_WORKERS=10
ZG_COMPUTE_TIMEOUT=300000
ZG_COMPUTE_RETRY_ATTEMPTS=3
```

**Time:** 2 minutes

### ☐ Step 3: Test Integration

```bash
cd doa_adi
npx ts-node scripts/test-0g-enhancement.ts
```

Expected output:
```
✅ Enhancement successful!
🎯 Generated Tagline: "..."
📊 0G Compute Metadata: ...
```

**Time:** 2 minutes (+ 30 seconds for 0G processing)

### ☐ Step 4: Add Frontend Tab

Edit `frontend/components/DAOApp.tsx`:

```typescript
// 1. Add import at top
import ZeroGravityTab from './ZeroGravityTab';

// 2. Add tab button (with other tabs)
<button
  onClick={() => setActiveTab('zerogravity')}
  className={`px-6 py-3 rounded-lg transition-colors ${
    activeTab === 'zerogravity'
      ? 'bg-purple-600 text-white'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
  }`}
>
  ⚡ 0G Network
</button>

// 3. Add tab content (with other tab contents)
{activeTab === 'zerogravity' && <ZeroGravityTab />}
```

**Time:** 3 minutes

### ☐ Step 5: Test End-to-End

1. Start Telegram bot: `npm run bot`
2. Send a video to bot
3. Click "Analyze with 0G Compute"
4. Wait for analysis (30-60 seconds)
5. Check for tagline in response
6. Click "Create DAO Proposal"
7. Verify proposal includes 0G tagline
8. Check frontend 0G tab

**Time:** 5 minutes

---

## Total Setup Time: ~20 minutes

## Verification Checklist

### Backend Integration
- ☐ Test script runs successfully
- ☐ Tagline is generated
- ☐ Enhanced analysis file is created
- ☐ 0G metadata is present

### Bot Integration
- ☐ Bot mentions "0G Compute" in messages
- ☐ Analysis includes tagline
- ☐ Proposals show 0G section
- ☐ No errors in bot logs

### Frontend Integration
- ☐ 0G tab is visible
- ☐ Transactions are displayed
- ☐ Compute tasks show model/execution time
- ☐ Storage operations show file hashes

### For Hackathon Demo
- ☐ Can show 0G tab to judges
- ☐ Can create proposal with 0G tagline
- ☐ Can explain 0G integration
- ☐ Have transaction proofs ready

## Troubleshooting

### Issue: Test script fails
```bash
# Check if credentials are set
echo $ZG_COMPUTE_PRIVATE_KEY

# If empty, add to .env and reload
source .env
```

### Issue: Bot doesn't use 0G
```bash
# Check bot logs for:
[0G Integration] ✅ 0G Compute integration enabled

# If you see:
[0G Integration] ⚠️ 0G Compute not configured

# Then credentials are missing from .env
```

### Issue: Frontend tab not showing
```bash
# Make sure you:
1. Added import statement
2. Added tab button
3. Added tab content
4. Restarted dev server
```

### Issue: "Task timeout"
```bash
# Increase timeout in .env:
ZG_COMPUTE_TIMEOUT=600000  # 10 minutes
```

## Files to Show Judges

1. **Code Files:**
   - `zero-gravity/compute/tagline-generator.ts`
   - `tg_analysis/enhance-analysis-with-0g.ts`
   - `frontend/components/ZeroGravityTab.tsx`

2. **Documentation:**
   - `0G_COMPUTE_INTEGRATION_GUIDE.md`
   - `0G_EXAMPLE_OUTPUT.md`

3. **Live Demo:**
   - Frontend 0G tab
   - Create proposal with 0G tagline
   - Show transaction history

## Quick Demo Script

1. **Show Frontend Tab:**
   "Here's our 0G Network integration tab showing all compute and storage transactions"

2. **Create Proposal:**
   "Let me create a new proposal. Notice the AI-generated tagline powered by 0G Compute"

3. **Show Metadata:**
   "You can see the execution time, node ID, and model used - proving real 0G integration"

4. **Explain Benefits:**
   "This uses 0G's free Llama-3-8B model for decentralized AI processing"

## Success Criteria

✅ Test script completes successfully
✅ Bot creates proposals with 0G taglines
✅ Frontend shows 0G transactions
✅ Can demonstrate to judges
✅ Have proof of 0G usage (node IDs, execution times)

---

**Ready to go?** Start with Step 1! 🚀
