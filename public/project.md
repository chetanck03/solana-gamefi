## ClashGo
Daily On-Chain Competitive Mobile Game
Built for the Solana Mobile ecosystem on Solana

1. Vision

ClashGo is a mobile-first competitive micro-game designed specifically for the Solana Mobile ecosystem.

The goal is to create a fast, addictive, daily on-chain competitive experience where users engage in 60-second PvP battles, earn XP, maintain streaks, and climb global leaderboards.

2. Problem Statement

Most Web3 applications struggle with daily engagement and long-term retention.
Many dApps function primarily as financial tools rather than fun consumer experiences.
Solana Mobile requires high-stickiness, mobile-native applications that deliver meaningful on-chain interaction while remaining engaging and easy to use.

3. Solution Overview

ClashGo introduces:
* 60-second PvP micro battles
* Daily streak multiplier system
* On-chain XP tracking
* Soulbound achievement badges
* Weekly global leaderboards

This creates a competitive habit loop powered by on-chain interaction.

4. Core Gameplay – PvP Battle Arena

Flow:
1. User connects wallet via Solana Mobile Wallet Adapter.
2. User joins a match (Free mode or small SOL entry).
3. Auto-matching pairs the player with another competitor.
4. 60-second challenge begins (tap-speed, reaction, or trivia).
5. Smart contract settles the result on-chain.
6. XP and optional SOL rewards are distributed on-chain.

This ensures fast gameplay with meaningful blockchain interaction.

5. Daily Prediction Challenge

Once per day, users can:
* Predict SOL price movement (up/down)
* Answer a mini Web3 trivia question
* Guess network fee range

Users sign a transaction, optionally stake a small amount of SOL, and earn XP based on accuracy.
This creates an additional daily engagement hook.

6. Mystery Box (Retention Hook)

Daily free claim includes:
* Small XP reward
* Chance to receive a rare badge
* Temporary streak boost
Premium mode:
* Small SOL entry
* Higher reward probability

This guarantees daily open behavior.

7. Streak & XP System

* Daily login streak tracking
* 7-day streak badge reward
* 30-day rare badge reward
* XP ladder progression system
* Weekly leaderboard reset

This creates long-term engagement and competitive motivation.

8. On-Chain Architecture (Anchor Program)

Core Accounts:
* PlayerProfile
* XPAccount
* StreakAccount
* MatchPool
* PredictionPool
* RewardVault
* BadgeMint
Core Instructions:
* initialize_player()
* join_match()
* submit_score()
* settle_match()
* submit_prediction()
* claim_mystery_box()
* update_streak()
* mint_badge()

All major interactions are settled on-chain to ensure transparency and fairness.

9. Tech Stack

- Frontend: React Native (Android-first design)
- Blockchain: Solana + Anchor framework
- Wallet Integration: Solana Mobile Wallet Adapter
- Backend: Node.js (match coordination only)
- Database: PostgreSQL neon cloud (off-chain stats caching)
- Deployment: Functional Android APK required for submission

10. Economy Design

* Free mode available
* Optional micro SOL entry mode
* XP is non-transferable
* Badges are soulbound
* No complex inflationary tokenomics

This ensures sustainability and simplicity.

11. Demo Flow for Judges

1. Connect wallet
2. Join live battle
3. Play 60-second match
4. Show on-chain transaction confirmation
5. XP and leaderboard update
6. Claim mystery box reward

Fast, clear, and visually engaging demo sequence.

12. Why This Project Can Win

* High stickiness through daily streak system
* Real on-chain transactions with meaningful interaction
* Mobile-first native UX design
* Competitive leaderboard structure
* Strong live demo presentation potential
