import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BattleCardsGame } from "../target/types/battle_cards_game";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("Simple Battle Cards Game Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BattleCardsGame as Program<BattleCardsGame>;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Provider wallet:", provider.wallet.publicKey.toString());

  it("Test 1: Initialize a player", async () => {
    const player = Keypair.generate();
    
    // Airdrop SOL
    console.log("Requesting airdrop for player...");
    const airdropSig = await provider.connection.requestAirdrop(
      player.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
    console.log("Airdrop confirmed");

    const [playerAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player.publicKey.toBuffer()],
      program.programId
    );

    const username = "TestPlayer";
    
    console.log("Initializing player...");
    const tx = await program.methods
      .initializePlayer(username)
      .accounts({
        authority: player.publicKey,
      })
      .signers([player])
      .rpc();

    console.log("Transaction signature:", tx);

    const playerData = await program.account.player.fetch(playerAccount);
    console.log("Player created:", {
      username: playerData.username,
      xp: playerData.xp.toString(),
      level: playerData.level,
      wins: playerData.wins,
      losses: playerData.losses,
    });

    console.log("✅ Test 1 passed: Player initialized successfully");
  });

  it("Test 2: Purchase a fighter", async () => {
    const buyer = Keypair.generate();
    const treasury = Keypair.generate();
    
    console.log("Requesting airdrop for buyer...");
    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
    console.log("Airdrop confirmed");

    const fighterName = "Dragon";
    const price = 0.1 * LAMPORTS_PER_SOL;

    const [fighterOwnership] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("fighter"),
        buyer.publicKey.toBuffer(),
        Buffer.from(fighterName),
      ],
      program.programId
    );

    console.log("Purchasing fighter...");
    const tx = await program.methods
      .purchaseFighter(fighterName, new anchor.BN(price))
      .accounts({
        buyer: buyer.publicKey,
        treasury: treasury.publicKey,
      })
      .signers([buyer])
      .rpc();

    console.log("Transaction signature:", tx);

    const fighterData = await program.account.fighterOwnership.fetch(fighterOwnership);
    console.log("Fighter purchased:", {
      owner: fighterData.owner.toString(),
      fighterName: fighterData.fighterName,
      pricePaid: fighterData.pricePaid.toString(),
    });

    const treasuryBalance = await provider.connection.getBalance(treasury.publicKey);
    console.log("Treasury balance:", treasuryBalance / LAMPORTS_PER_SOL, "SOL");

    console.log("✅ Test 2 passed: Fighter purchased successfully");
  });

  it("Test 3: Create and complete a match", async () => {
    const player1 = Keypair.generate();
    const player2 = Keypair.generate();
    
    console.log("Requesting airdrops...");
    const airdrop1 = await provider.connection.requestAirdrop(
      player1.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const airdrop2 = await provider.connection.requestAirdrop(
      player2.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);
    await provider.connection.confirmTransaction(airdrop2);
    console.log("Airdrops confirmed");

    // Initialize players
    const [player1Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player1.publicKey.toBuffer()],
      program.programId
    );
    const [player2Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player2.publicKey.toBuffer()],
      program.programId
    );

    console.log("Initializing player 1...");
    await program.methods
      .initializePlayer("Player1")
      .accounts({ authority: player1.publicKey })
      .signers([player1])
      .rpc();

    console.log("Initializing player 2...");
    await program.methods
      .initializePlayer("Player2")
      .accounts({ authority: player2.publicKey })
      .signers([player2])
      .rpc();

    // Create match
    const matchAccount = Keypair.generate();
    const entryFee = 0.05 * LAMPORTS_PER_SOL;

    console.log("Creating match...");
    const createTx = await program.methods
      .createMatch(new anchor.BN(entryFee), { quick: {} })
      .accounts({
        matchAccount: matchAccount.publicKey,
        player1: player1.publicKey,
      })
      .signers([player1, matchAccount])
      .rpc();
    console.log("Match created:", createTx);

    // Join match
    console.log("Player 2 joining match...");
    const joinTx = await program.methods
      .joinMatch()
      .accounts({
        matchAccount: matchAccount.publicKey,
        player2: player2.publicKey,
      })
      .signers([player2])
      .rpc();
    console.log("Player 2 joined:", joinTx);

    // Complete match
    console.log("Completing match with player 1 as winner...");
    const completeTx = await program.methods
      .completeMatch(player1.publicKey)
      .accounts({
        matchAccount: matchAccount.publicKey,
        player1: player1Account,
        player2: player2Account,
      })
      .rpc();
    console.log("Match completed:", completeTx);

    const matchData = await program.account.match.fetch(matchAccount.publicKey);
    const player1Data = await program.account.player.fetch(player1Account);
    const player2Data = await program.account.player.fetch(player2Account);

    console.log("Match result:", {
      winner: matchData.winner.toString(),
      status: matchData.status,
    });
    console.log("Player 1 stats:", {
      wins: player1Data.wins,
      losses: player1Data.losses,
      xp: player1Data.xp.toString(),
      streak: player1Data.currentStreak,
    });
    console.log("Player 2 stats:", {
      wins: player2Data.wins,
      losses: player2Data.losses,
      xp: player2Data.xp.toString(),
      streak: player2Data.currentStreak,
    });

    console.log("✅ Test 3 passed: Match completed successfully");
  });

  it("Test 4: Quiz system", async () => {
    const user = Keypair.generate();
    const rewardWallet = Keypair.generate();
    
    console.log("Requesting airdrops...");
    const airdrop1 = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const airdrop2 = await provider.connection.requestAirdrop(
      rewardWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);
    await provider.connection.confirmTransaction(airdrop2);
    console.log("Airdrops confirmed");

    const [quizConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("quiz_config")],
      program.programId
    );
    const [quizAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("quiz"), user.publicKey.toBuffer()],
      program.programId
    );

    const rewardAmount = 0.001 * LAMPORTS_PER_SOL;

    console.log("Initializing quiz config...");
    await program.methods
      .initializeQuizConfig(rewardWallet.publicKey, new anchor.BN(rewardAmount))
      .accounts({ authority: provider.wallet.publicKey })
      .rpc();

    console.log("Initializing quiz for user...");
    await program.methods
      .initializeQuiz()
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();

    console.log("Submitting quiz...");
    const submitTx = await program.methods
      .submitQuiz(true)
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();
    console.log("Quiz submitted:", submitTx);

    const quizData = await program.account.quizState.fetch(quizAccount);
    console.log("Quiz data:", {
      totalAttempts: quizData.totalAttempts,
      correctAttempts: quizData.correctAttempts,
      pendingReward: quizData.pendingReward.toString(),
    });

    console.log("✅ Test 4 passed: Quiz system working");
  });

  it("Test 5: Streak system", async () => {
    const user = Keypair.generate();
    const rewardWallet = Keypair.generate();
    
    console.log("Requesting airdrops...");
    const airdrop1 = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const airdrop2 = await provider.connection.requestAirdrop(
      rewardWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);
    await provider.connection.confirmTransaction(airdrop2);
    console.log("Airdrops confirmed");

    const [streakConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("streak_config")],
      program.programId
    );
    const [streakAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("streak"), user.publicKey.toBuffer()],
      program.programId
    );

    console.log("Initializing streak config...");
    await program.methods
      .initializeStreakConfig(rewardWallet.publicKey)
      .accounts({ authority: provider.wallet.publicKey })
      .rpc();

    console.log("Initializing streak for user...");
    await program.methods
      .initializeStreak()
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();

    console.log("Checking in...");
    const checkInTx = await program.methods
      .checkIn()
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();
    console.log("Check-in completed:", checkInTx);

    const streakData = await program.account.streakState.fetch(streakAccount);
    console.log("Streak data:", {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalCheckIns: streakData.totalCheckIns,
    });

    console.log("✅ Test 5 passed: Streak system working");
  });
});
