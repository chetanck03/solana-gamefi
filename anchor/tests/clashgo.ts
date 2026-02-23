import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Clashgo } from "../target/types/clashgo";
import { assert } from "chai";

describe("clashgo", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Clashgo as Program<Clashgo>;
  const player = provider.wallet;

  let playerProfilePDA: anchor.web3.PublicKey;
  let playerProfileBump: number;

  before(async () => {
    [playerProfilePDA, playerProfileBump] = 
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("player"), player.publicKey.toBuffer()],
        program.programId
      );
  });

  it("Initializes a player profile", async () => {
    const username = "TestPlayer";

    await program.methods
      .initializePlayer(username)
      .accounts({
        playerProfile: playerProfilePDA,
        authority: player.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const profile = await program.account.playerProfile.fetch(playerProfilePDA);
    
    assert.equal(profile.username, username);
    assert.equal(profile.xp.toNumber(), 0);
    assert.equal(profile.level, 1);
    assert.equal(profile.currentStreak, 0);
  });

  it("Updates player streak", async () => {
    await program.methods
      .updateStreak()
      .accounts({
        playerProfile: playerProfilePDA,
        authority: player.publicKey,
      })
      .rpc();

    const profile = await program.account.playerProfile.fetch(playerProfilePDA);
    assert.equal(profile.currentStreak, 1);
  });

  it("Claims mystery box", async () => {
    const boxType = { free: {} };

    await program.methods
      .claimMysteryBox(boxType)
      .accounts({
        playerProfile: playerProfilePDA,
        authority: player.publicKey,
      })
      .rpc();

    const profile = await program.account.playerProfile.fetch(playerProfilePDA);
    assert.isTrue(profile.xp.toNumber() > 0);
  });

  it("Joins a match", async () => {
    const matchPool = anchor.web3.Keypair.generate();
    const rewardVault = anchor.web3.Keypair.generate();
    const gameType = { tapSpeed: {} };
    const entryFee = new anchor.BN(0);

    await program.methods
      .joinMatch(gameType, entryFee)
      .accounts({
        matchPool: matchPool.publicKey,
        authority: player.publicKey,
        rewardVault: rewardVault.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([matchPool])
      .rpc();

    const match = await program.account.matchPool.fetch(matchPool.publicKey);
    assert.equal(match.player1.toString(), player.publicKey.toString());
    assert.equal(match.entryFee.toNumber(), 0);
  });

  it("Submits a prediction", async () => {
    const prediction = anchor.web3.Keypair.generate();
    const rewardVault = anchor.web3.Keypair.generate();
    const predictionType = { price: {} };
    const predictionValue = "up";
    const stake = new anchor.BN(0);

    await program.methods
      .submitPrediction(predictionType, predictionValue, stake)
      .accounts({
        prediction: prediction.publicKey,
        authority: player.publicKey,
        rewardVault: rewardVault.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([prediction])
      .rpc();

    const pred = await program.account.prediction.fetch(prediction.publicKey);
    assert.equal(pred.prediction, predictionValue);
    assert.equal(pred.stake.toNumber(), 0);
  });
});
