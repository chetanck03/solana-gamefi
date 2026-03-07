import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BattleCardsGame } from "../target/types/battle_cards_game";
import { expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("battle-cards-game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BattleCardsGame as Program<BattleCardsGame>;
  
  // Test accounts
  let player1: Keypair;
  let player2: Keypair;
  let treasury: Keypair;
  let player1Account: PublicKey;
  let player2Account: PublicKey;

  before(async () => {
    player1 = Keypair.generate();
    player2 = Keypair.generate();
    treasury = Keypair.generate();

    // Airdrop SOL to test accounts
    const airdropSig1 = await provider.connection.requestAirdrop(
      player1.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig1);

    const airdropSig2 = await provider.connection.requestAirdrop(
      player2.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig2);

    // Derive player PDAs
    [player1Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player1.publicKey.toBuffer()],
      program.programId
    );

    [player2Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player2.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Player Management", () => {
    it("Initializes player 1", async () => {
      const username = "Player1";
      
      await program.methods
        .initializePlayer(username)
        .accounts({
          authority: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      const playerData = await program.account.player.fetch(player1Account);
      
      expect(playerData.username).to.equal(username);
      expect(playerData.authority.toString()).to.equal(player1.publicKey.toString());
      expect(playerData.xp.toNumber()).to.equal(0);
      expect(playerData.level).to.equal(1);
      expect(playerData.wins).to.equal(0);
      expect(playerData.losses).to.equal(0);
      expect(playerData.currentStreak).to.equal(0);
    });

    it("Initializes player 2", async () => {
      const username = "Player2";
      
      await program.methods
        .initializePlayer(username)
        .accounts({
          authority: player2.publicKey,
        })
        .signers([player2])
        .rpc();

      const playerData = await program.account.player.fetch(player2Account);
      expect(playerData.username).to.equal(username);
    });
  });

  describe("Fighter Purchase", () => {
    it("Purchases a fighter", async () => {
      const fighterName = "Dragon";
      const price = 0.1 * LAMPORTS_PER_SOL;

      const [fighterOwnership] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("fighter"),
          player1.publicKey.toBuffer(),
          Buffer.from(fighterName),
        ],
        program.programId
      );

      const treasuryBalanceBefore = await provider.connection.getBalance(
        treasury.publicKey
      );

      await program.methods
        .purchaseFighter(fighterName, new anchor.BN(price))
        .accounts({
          buyer: player1.publicKey,
          treasury: treasury.publicKey,
        })
        .signers([player1])
        .rpc();

      const fighterData = await program.account.fighterOwnership.fetch(
        fighterOwnership
      );

      expect(fighterData.owner.toString()).to.equal(player1.publicKey.toString());
      expect(fighterData.fighterName).to.equal(fighterName);
      expect(fighterData.pricePaid.toNumber()).to.equal(price);

      const treasuryBalanceAfter = await provider.connection.getBalance(
        treasury.publicKey
      );
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(price);
    });

    it("Purchases a free fighter", async () => {
      const fighterName = "Starter";
      const price = 0;

      const [fighterOwnership] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("fighter"),
          player2.publicKey.toBuffer(),
          Buffer.from(fighterName),
        ],
        program.programId
      );

      await program.methods
        .purchaseFighter(fighterName, new anchor.BN(price))
        .accounts({
          buyer: player2.publicKey,
          treasury: treasury.publicKey,
        })
        .signers([player2])
        .rpc();

      const fighterData = await program.account.fighterOwnership.fetch(
        fighterOwnership
      );
      expect(fighterData.pricePaid.toNumber()).to.equal(0);
    });
  });

  describe("Match Management", () => {
    let matchAccount: Keypair;
    const entryFee = 0.05 * LAMPORTS_PER_SOL;

    it("Creates a match", async () => {
      matchAccount = Keypair.generate();

      await program.methods
        .createMatch(new anchor.BN(entryFee), { quick: {} })
        .accounts({
          matchAccount: matchAccount.publicKey,
          player1: player1.publicKey,
        })
        .signers([player1, matchAccount])
        .rpc();

      const matchData = await program.account.match.fetch(matchAccount.publicKey);
      
      expect(matchData.player1.toString()).to.equal(player1.publicKey.toString());
      expect(matchData.entryFee.toNumber()).to.equal(entryFee);
      expect(matchData.status).to.deep.equal({ waiting: {} });
      expect(matchData.gameMode).to.deep.equal({ quick: {} });
    });

    it("Player 2 joins the match", async () => {
      await program.methods
        .joinMatch()
        .accounts({
          matchAccount: matchAccount.publicKey,
          player2: player2.publicKey,
        })
        .signers([player2])
        .rpc();

      const matchData = await program.account.match.fetch(matchAccount.publicKey);
      
      expect(matchData.player2.toString()).to.equal(player2.publicKey.toString());
      expect(matchData.status).to.deep.equal({ active: {} });
    });

    it("Completes the match with player 1 winning", async () => {
      const player1DataBefore = await program.account.player.fetch(player1Account);
      const player2DataBefore = await program.account.player.fetch(player2Account);

      await program.methods
        .completeMatch(player1.publicKey)
        .accounts({
          matchAccount: matchAccount.publicKey,
          player1: player1Account,
          player2: player2Account,
        })
        .rpc();

      const matchData = await program.account.match.fetch(matchAccount.publicKey);
      expect(matchData.status).to.deep.equal({ completed: {} });
      expect(matchData.winner.toString()).to.equal(player1.publicKey.toString());

      const player1DataAfter = await program.account.player.fetch(player1Account);
      const player2DataAfter = await program.account.player.fetch(player2Account);

      // Player 1 should have won
      expect(player1DataAfter.wins).to.equal(player1DataBefore.wins + 1);
      expect(player1DataAfter.currentStreak).to.equal(player1DataBefore.currentStreak + 1);
      expect(player1DataAfter.xp.toNumber()).to.equal(player1DataBefore.xp.toNumber() + 100);

      // Player 2 should have lost
      expect(player2DataAfter.losses).to.equal(player2DataBefore.losses + 1);
      expect(player2DataAfter.currentStreak).to.equal(0);
      expect(player2DataAfter.xp.toNumber()).to.equal(player2DataBefore.xp.toNumber() + 25);
    });
  });

  describe("Quiz System", () => {
    let quizAccount: PublicKey;
    let quizConfigAccount: PublicKey;
    let rewardWallet: Keypair;

    before(() => {
      rewardWallet = Keypair.generate();
      
      [quizAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("quiz"), player1.publicKey.toBuffer()],
        program.programId
      );

      [quizConfigAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("quiz_config")],
        program.programId
      );
    });

    it("Initializes quiz config", async () => {
      const rewardAmount = 0.01 * LAMPORTS_PER_SOL;

      await program.methods
        .initializeQuizConfig(rewardWallet.publicKey, new anchor.BN(rewardAmount))
        .accounts({
          authority: provider.wallet.publicKey,
        })
        .rpc();

      const configData = await program.account.quizConfig.fetch(quizConfigAccount);
      expect(configData.rewardWallet.toString()).to.equal(rewardWallet.publicKey.toString());
      expect(configData.rewardAmount.toNumber()).to.equal(rewardAmount);
    });

    it("Initializes quiz for player", async () => {
      await program.methods
        .initializeQuiz()
        .accounts({
          user: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      const quizData = await program.account.quizState.fetch(quizAccount);
      expect(quizData.user.toString()).to.equal(player1.publicKey.toString());
      expect(quizData.totalAttempts).to.equal(0);
      expect(quizData.pendingReward.toNumber()).to.equal(0);
    });

    it("Submits quiz with correct answers", async () => {
      await program.methods
        .submitQuiz(true)
        .accounts({
          user: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      const quizData = await program.account.quizState.fetch(quizAccount);
      expect(quizData.totalAttempts).to.equal(1);
      expect(quizData.correctAttempts).to.equal(1);
    });
  });

  describe("Streak System", () => {
    let streakAccount: PublicKey;
    let streakConfigAccount: PublicKey;
    let rewardWallet: Keypair;

    before(() => {
      rewardWallet = Keypair.generate();
      
      [streakAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("streak"), player1.publicKey.toBuffer()],
        program.programId
      );

      [streakConfigAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("streak_config")],
        program.programId
      );
    });

    it("Initializes streak config", async () => {
      await program.methods
        .initializeStreakConfig(rewardWallet.publicKey)
        .accounts({
          authority: provider.wallet.publicKey,
        })
        .rpc();

      const configData = await program.account.streakConfig.fetch(streakConfigAccount);
      expect(configData.rewardWallet.toString()).to.equal(rewardWallet.publicKey.toString());
    });

    it("Initializes streak for player", async () => {
      await program.methods
        .initializeStreak()
        .accounts({
          user: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      const streakData = await program.account.streakState.fetch(streakAccount);
      expect(streakData.user.toString()).to.equal(player1.publicKey.toString());
      expect(streakData.currentStreak).to.equal(0);
    });

    it("Checks in to increment streak", async () => {
      await program.methods
        .checkIn()
        .accounts({
          user: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      const streakData = await program.account.streakState.fetch(streakAccount);
      expect(streakData.currentStreak).to.equal(1);
    });
  });
});
