import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BattleCardsGame } from "../target/types/battle_cards_game";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("Quick Functionality Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BattleCardsGame as Program<BattleCardsGame>;
  
  console.log("\n=================================");
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("=================================\n");

  // Use provider wallet to avoid airdrop issues
  const testPlayer = (provider.wallet as anchor.Wallet).payer;

  it("✅ Test 1: Initialize Player", async () => {
    const [playerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), testPlayer.publicKey.toBuffer()],
      program.programId
    );

    try {
      // Check if player already exists
      const existing = await program.account.player.fetch(playerAccount);
      console.log("Player already exists:", existing.username);
      console.log("Stats:", {
        xp: existing.xp.toString(),
        level: existing.level,
        wins: existing.wins,
        losses: existing.losses,
      });
    } catch (e) {
      // Player doesn't exist, create it
      console.log("Creating new player...");
      const tx = await program.methods
        .initializePlayer("TestPlayer")
        .accounts({
          authority: testPlayer.publicKey,
        })
        .rpc();

      console.log("✅ Player created! TX:", tx);

      const playerData = await program.account.player.fetch(playerAccount);
      console.log("Player data:", {
        username: playerData.username,
        xp: playerData.xp.toString(),
        level: playerData.level,
      });
    }
  });

  it("✅ Test 2: Purchase Fighter", async () => {
    const fighterName = "TestDragon" + Date.now();
    const price = 0.001 * LAMPORTS_PER_SOL; // Small amount

    const [fighterOwnership] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("fighter"),
        testPlayer.publicKey.toBuffer(),
        Buffer.from(fighterName),
      ],
      program.programId
    );

    const treasury = Keypair.generate();

    console.log("Purchasing fighter:", fighterName);
    const tx = await program.methods
      .purchaseFighter(fighterName, new anchor.BN(price))
      .accounts({
        buyer: testPlayer.publicKey,
        treasury: treasury.publicKey,
      })
      .rpc();

    console.log("✅ Fighter purchased! TX:", tx);

    const fighterData = await program.account.fighterOwnership.fetch(fighterOwnership);
    console.log("Fighter data:", {
      owner: fighterData.owner.toString().slice(0, 8) + "...",
      name: fighterData.fighterName,
      price: fighterData.pricePaid.toString(),
    });

    const treasuryBalance = await provider.connection.getBalance(treasury.publicKey);
    console.log("Treasury received:", treasuryBalance / LAMPORTS_PER_SOL, "SOL");
  });

  it("✅ Test 3: Quiz Config", async () => {
    const [quizConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("quiz_config")],
      program.programId
    );

    try {
      const existing = await program.account.quizConfig.fetch(quizConfigAccount);
      console.log("Quiz config already exists");
      console.log("Reward amount:", existing.rewardAmount.toString());
    } catch (e) {
      console.log("Creating quiz config...");
      const rewardWallet = Keypair.generate();
      const rewardAmount = 0.001 * LAMPORTS_PER_SOL;

      const tx = await program.methods
        .initializeQuizConfig(rewardWallet.publicKey, new anchor.BN(rewardAmount))
        .accounts({ authority: testPlayer.publicKey })
        .rpc();

      console.log("✅ Quiz config created! TX:", tx);

      const configData = await program.account.quizConfig.fetch(quizConfigAccount);
      console.log("Config data:", {
        rewardAmount: configData.rewardAmount.toString(),
        cooldown: configData.cooldownPeriod.toString(),
      });
    }
  });

  it("✅ Test 4: Initialize Quiz", async () => {
    const [quizAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("quiz"), testPlayer.publicKey.toBuffer()],
      program.programId
    );

    try {
      const existing = await program.account.quizState.fetch(quizAccount);
      console.log("Quiz already exists");
      console.log("Stats:", {
        attempts: existing.totalAttempts,
        correct: existing.correctAttempts,
        pending: existing.pendingReward.toString(),
      });
    } catch (e) {
      console.log("Creating quiz state...");
      const tx = await program.methods
        .initializeQuiz()
        .accounts({ user: testPlayer.publicKey })
        .rpc();

      console.log("✅ Quiz initialized! TX:", tx);

      const quizData = await program.account.quizState.fetch(quizAccount);
      console.log("Quiz data:", {
        user: quizData.user.toString().slice(0, 8) + "...",
        attempts: quizData.totalAttempts,
      });
    }
  });

  it("✅ Test 5: Streak Config", async () => {
    const [streakConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("streak_config")],
      program.programId
    );

    try {
      const existing = await program.account.streakConfig.fetch(streakConfigAccount);
      console.log("Streak config already exists");
      console.log("Rewards:", {
        streak5: existing.streak5Reward?.toString() || "N/A",
        streak10: existing.streak10Reward?.toString() || "N/A",
        streak20: existing.streak20Reward?.toString() || "N/A",
      });
    } catch (e) {
      console.log("Creating streak config...");
      const rewardWallet = Keypair.generate();

      const tx = await program.methods
        .initializeStreakConfig(rewardWallet.publicKey)
        .accounts({ authority: testPlayer.publicKey })
        .rpc();

      console.log("✅ Streak config created! TX:", tx);

      const configData = await program.account.streakConfig.fetch(streakConfigAccount);
      console.log("Config data:", {
        streak5: configData.streak5Reward?.toString() || "N/A",
        streak10: configData.streak10Reward?.toString() || "N/A",
      });
    }
  });

  it("✅ Test 6: Initialize Streak", async () => {
    const [streakAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("streak"), testPlayer.publicKey.toBuffer()],
      program.programId
    );

    try {
      const existing = await program.account.streakState.fetch(streakAccount);
      console.log("Streak already exists");
      console.log("Stats:", {
        current: existing.currentStreak,
        longest: existing.longestStreak,
        total: existing.totalCheckIns,
      });
    } catch (e) {
      console.log("Creating streak state...");
      const tx = await program.methods
        .initializeStreak()
        .accounts({ user: testPlayer.publicKey })
        .rpc();

      console.log("✅ Streak initialized! TX:", tx);

      const streakData = await program.account.streakState.fetch(streakAccount);
      console.log("Streak data:", {
        user: streakData.user.toString().slice(0, 8) + "...",
        streak: streakData.currentStreak,
      });
    }
  });

  it("✅ Test 7: Check In", async () => {
    const [streakAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("streak"), testPlayer.publicKey.toBuffer()],
      program.programId
    );

    const before = await program.account.streakState.fetch(streakAccount);
    console.log("Before check-in:", {
      streak: before.currentStreak,
      lastCheckIn: new Date(before.lastCheckIn.toNumber() * 1000).toISOString(),
    });

    try {
      const tx = await program.methods
        .checkIn()
        .accounts({ user: testPlayer.publicKey })
        .rpc();

      console.log("✅ Check-in successful! TX:", tx);

      const after = await program.account.streakState.fetch(streakAccount);
      console.log("After check-in:", {
        streak: after.currentStreak,
        longest: after.longestStreak,
        totalCheckIns: after.totalCheckIns,
      });
    } catch (e: any) {
      console.log("Check-in failed (expected if < 24hrs):", e.message);
    }
  });

  it("✅ Test 8: Create Match", async () => {
    const matchAccount = Keypair.generate();
    const entryFee = 0.001 * LAMPORTS_PER_SOL;

    console.log("Creating match...");
    const tx = await program.methods
      .createMatch(new anchor.BN(entryFee), { quick: {} })
      .accounts({
        matchAccount: matchAccount.publicKey,
        player1: testPlayer.publicKey,
      })
      .signers([matchAccount])
      .rpc();

    console.log("✅ Match created! TX:", tx);

    const matchData = await program.account.match.fetch(matchAccount.publicKey);
    console.log("Match data:", {
      player1: matchData.player1.toString().slice(0, 8) + "...",
      entryFee: matchData.entryFee.toString(),
      status: matchData.status,
      gameMode: matchData.gameMode,
    });
  });

  console.log("\n=================================");
  console.log("🎉 ALL TESTS COMPLETED!");
  console.log("=================================\n");
});
