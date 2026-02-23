# ClashGo 
**Daily On-Chain Competitive Mobile Game for Solana**

A mobile-first competitive micro-game built for the Solana Mobile ecosystem with 60-second PvP battles, daily challenges, and on-chain rewards.

---

##  Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on Android
yarn android
```

---

## Project Structure

```
clashgo/
├── src/
│   ├── screens/             # 6 main screens
│   │   ├── HomeScreen.tsx           # Dashboard
│   │   ├── BattleScreen.tsx         # PvP gameplay
│   │   ├── PredictionScreen.tsx     # Daily predictions
│   │   ├── MysteryBoxScreen.tsx     # Reward boxes
│   │   ├── LeaderboardScreen.tsx    # Rankings
│   │   └── ProfileScreen.tsx        # Player stats
│   ├── components/          # Reusable UI components
│   ├── navigation/          # React Navigation setup
│   ├── services/            # Blockchain interactions
│   ├── hooks/               # Custom React hooks
│   ├── context/             # Global state management
│   ├── types/               # TypeScript definitions
│   ├── constants/           # App configuration
│   └── utils/               # Helper functions
├── anchor/                  # Solana smart contracts
│   └── programs/clashgo/
│       └── src/lib.rs       # Anchor program
└── App.tsx                  # Entry point
```

---

## 🎮 Features

### Core Gameplay
- **60-Second PvP Battles** - Tap Speed, Reaction Time, Web3 Trivia
- **Free & Paid Modes** - Play free or stake SOL for bigger rewards
- **Daily Predictions** - Predict SOL price movements
- **Mystery Boxes** - Daily free box + premium boxes
- **Streak System** - Maintain daily login streaks
- **Global Leaderboards** - Daily, Weekly, All-time rankings
- **Badge Collection** - Earn soulbound achievement badges
- **XP & Leveling** - Progress through levels

### Blockchain Features
- ✅ On-chain player profiles
- ✅ On-chain match results
- ✅ On-chain predictions
- ✅ Transparent reward distribution
- ✅ Soulbound badges (non-transferable)

---

## Tech Stack

**Frontend**
- React Native 0.81.5
- Expo ~54.0
- TypeScript 5.9
- NativeWind (Tailwind CSS)
- React Navigation 7.0

**Blockchain**
- Solana
- Anchor Framework 0.30.1
- @solana/web3.js 1.98.4
- Solana Mobile Wallet Adapter

---

## Screens

### 1. Home Screen
Dashboard with wallet connection, stats overview, and quick action buttons.

### 2. Battle Screen
- Choose game mode (Tap Speed, Reaction, Trivia)
- Select entry mode (Free/Paid)
- Matchmaking and live gameplay
- Score submission

### 3. Prediction Screen
- Daily SOL price prediction (up/down)
- Stake optional SOL
- Earn XP for correct predictions

### 4. Mystery Box Screen
- Free box (24h cooldown)
- Premium box (0.01 SOL)
- Random XP and badge rewards

### 5. Leaderboard Screen
- Global rankings
- Filter by Daily/Weekly/All-time
- Player stats display

### 6. Profile Screen
- Player stats and level
- Win/loss record
- Badge collection
- Streak tracking

---

## ⚓ Anchor Program

### Accounts
```rust
PlayerProfile {
    authority: Pubkey,
    username: String,
    xp: u64,
    level: u32,
    current_streak: u32,
    longest_streak: u32,
    total_matches: u32,
    wins: u32,
    losses: u32,
    last_login: i64,
    last_box_claim: i64,
    created_at: i64,
}

MatchPool {
    player1: Pubkey,
    player2: Pubkey,
    game_type: GameType,
    entry_fee: u64,
    player1_score: u32,
    player2_score: u32,
    winner: Option<Pubkey>,
    status: MatchStatus,
    created_at: i64,
    ended_at: Option<i64>,
}

Prediction {
    player: Pubkey,
    prediction_type: PredictionType,
    prediction: String,
    stake: u64,
    result: Option<bool>,
    created_at: i64,
}
```

### Instructions
- `initialize_player()` - Create player account
- `join_match()` - Enter matchmaking
- `submit_score()` - Submit match result
- `settle_match()` - Distribute rewards
- `submit_prediction()` - Make daily prediction
- `claim_mystery_box()` - Open reward box
- `update_streak()` - Update login streak

---

## � Development

### Prerequisites
- Node.js 18+
- Yarn or npm
- Expo CLI
- Solana CLI
- Anchor Framework
- Android Studio

### Setup

1. **Install Dependencies**
```bash
yarn install
```

2. **Build Anchor Program**
```bash
cd anchor
anchor build
```

3. **Deploy to Devnet**
```bash
anchor deploy --provider.cluster devnet
```

4. **Update Program ID**
Copy the program ID and update in:
- `anchor/Anchor.toml`
- `anchor/programs/clashgo/src/lib.rs` (declare_id!)
- `src/services/blockchain.ts` (PROGRAM_ID)

5. **Run Tests**
```bash
anchor test
```

6. **Start App**
```bash
yarn start
yarn android
```

### Environment Variables
Create `.env` file:
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=YOUR_PROGRAM_ID_HERE
CLUSTER=devnet
```

---

## 🎨 Design System

### Colors
```typescript
Background: #0a0a1a (Dark)
Card: #1a1a2e (Darker)
Primary: #9945FF (Solana Purple)
Secondary: #14F195 (Solana Green)
Text: #ffffff (White)
Text Secondary: #888888 (Gray)
```

### Components
- Rounded corners (12px)
- Consistent padding (24px)
- Emoji icons for visual appeal
- Gradient backgrounds
- Smooth animations

---

## 🔐 Security

- ✅ All transactions require wallet signature
- ✅ Entry fees held in program-controlled vault
- ✅ XP and badges are soulbound (non-transferable)
- ✅ No private keys stored in app
- ✅ PDA (Program Derived Addresses) for all accounts
- ✅ Signer verification on all mutations

---

## 📊 Economy

- **Free-to-play** with optional paid modes
- **XP** earned through gameplay (non-transferable)
- **Badges** earned through achievements (soulbound)
- **Optional SOL entry** for prize pools
- **No inflationary tokenomics**

### Rewards
- Match win: +100 XP
- Match loss: +10 XP
- Correct prediction: +100 XP
- Free mystery box: 50-150 XP
- Premium mystery box: 200-500 XP
- 7-day streak: +500 XP + badge
- 30-day streak: +2000 XP + rare badge

---

## Current Status

### ✅ Completed
- Project structure organized
- All 6 screens implemented
- Navigation setup
- Wallet connection
- UI/UX design
- Anchor program structure
- Type definitions
- Constants and utilities

### ⏳ In Progress
- Blockchain service implementation
- IDL integration
- Real transaction handling
- Matchmaking backend
- Leaderboard API

### Todo
- Complete blockchain integration
- Deploy to devnet
- End-to-end testing
- Backend services
- Real-time features
- Production deployment

---

## Game Flow

### Playing a Match
1. User connects wallet
2. Clicks "Start Battle"
3. Selects game mode (Tap Speed/Reaction/Trivia)
4. Chooses entry mode (Free/Paid)
5. Matchmaking pairs players
6. 60-second gameplay
7. Submit score on-chain
8. Match settled, rewards distributed
9. XP and stats updated

### Daily Prediction
1. User makes prediction (SOL up/down)
2. Optional stake SOL
3. Prediction recorded on-chain
4. Check back next day for results
5. Claim XP rewards

### Mystery Box
1. User opens free daily box (or premium)
2. Random rewards generated
3. XP and badges distributed
4. Profile updated on-chain

---

## Commands

```bash
# Development
yarn start              # Start Expo dev server
yarn android            # Run on Android
yarn ios                # Run on iOS (Mac only)

# Anchor
cd anchor
anchor build            # Build program
anchor test             # Run tests
anchor deploy           # Deploy to cluster

# Production
eas build --platform android --profile production
```

---

## Next Steps

1. Install dependencies: `yarn install`
2. Test the app: `yarn start` → `yarn android`
3. Deploy Anchor program to devnet
4. Update program ID in all files
5. Implement blockchain service methods
6. Test end-to-end flows
7. Deploy to production

---

## Contributing

This is a hackathon/demo project. Feel free to fork and build upon it!

---

## License

MIT License - see LICENSE file for details

---

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ for Solana Mobile** 
