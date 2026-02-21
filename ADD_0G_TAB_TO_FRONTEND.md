# Add 0G Tab to Frontend - Quick Guide

## Step-by-Step Instructions

### 1. Open DAOApp.tsx

File: `frontend/components/DAOApp.tsx`

### 2. Add Import (at the top)

Find the imports section and add:

```typescript
import ZeroGravityTab from './ZeroGravityTab';
```

### 3. Add Tab Button

Find where the other tab buttons are (around line 50-80). Add this button:

```typescript
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
```

**Where to add it**: After the "Prediction Markets" button, before closing the button container.

### 4. Add Tab Content

Find where the other tab contents are (around line 100-150). Add this:

```typescript
{activeTab === 'zerogravity' && <ZeroGravityTab />}
```

**Where to add it**: After the prediction markets tab content, before closing the main container.

## Complete Example

Here's what the relevant sections should look like:

### Tab Buttons Section:
```typescript
<div className="flex gap-2 mb-6 overflow-x-auto">
  <button
    onClick={() => setActiveTab('proposals')}
    className={`px-6 py-3 rounded-lg transition-colors ${
      activeTab === 'proposals'
        ? 'bg-purple-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
  >
    📋 Proposals
  </button>
  
  <button
    onClick={() => setActiveTab('markets')}
    className={`px-6 py-3 rounded-lg transition-colors ${
      activeTab === 'markets'
        ? 'bg-purple-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
    }`}
  >
    📊 Prediction Markets
  </button>
  
  {/* ADD THIS NEW BUTTON */}
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
</div>
```

### Tab Content Section:
```typescript
{/* Existing tabs */}
{activeTab === 'proposals' && <ProposalList />}
{activeTab === 'markets' && <PredictionMarketsList />}

{/* ADD THIS NEW TAB CONTENT */}
{activeTab === 'zerogravity' && <ZeroGravityTab />}
```

## Visual Guide

### Before:
```
[📋 Proposals] [📊 Prediction Markets]
```

### After:
```
[📋 Proposals] [📊 Prediction Markets] [⚡ 0G Network]
```

## Testing

1. Save the file
2. Restart dev server: `npm run dev`
3. Open http://localhost:3001
4. Click "⚡ 0G Network" tab
5. You should see the 0G transactions page!

## Troubleshooting

### Tab button not showing
- Check you added the button in the correct location
- Make sure the syntax is correct (no missing brackets)
- Restart dev server

### Tab content not showing
- Check you added the content section
- Make sure `activeTab === 'zerogravity'` matches the button's `setActiveTab('zerogravity')`
- Check for typos

### Import error
- Make sure `ZeroGravityTab.tsx` exists in `frontend/components/`
- Check the import path is correct
- Restart dev server

## Quick Copy-Paste

### Import:
```typescript
import ZeroGravityTab from './ZeroGravityTab';
```

### Button:
```typescript
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
```

### Content:
```typescript
{activeTab === 'zerogravity' && <ZeroGravityTab />}
```

---

**That's it!** The 0G tab will now be visible in your frontend.
