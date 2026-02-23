use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod clashgo {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>, username: String) -> Result<()> {
        let player = &mut ctx.accounts.player_profile;
        player.authority = ctx.accounts.authority.key();
        player.username = username;
        player.xp = 0;
        player.level = 1;
        player.current_streak = 0;
        player.longest_streak = 0;
        player.total_matches = 0;
        player.wins = 0;
        player.losses = 0;
        player.last_login = Clock::get()?.unix_timestamp;
        player.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn join_match(
        ctx: Context<JoinMatch>,
        game_type: GameType,
        entry_fee: u64,
    ) -> Result<()> {
        let match_pool = &mut ctx.accounts.match_pool;
        let player = ctx.accounts.authority.key();
        
        // Transfer entry fee if paid mode
        if entry_fee > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.authority.key(),
                &ctx.accounts.reward_vault.key(),
                entry_fee,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.reward_vault.to_account_info(),
                ],
            )?;
        }

        match_pool.player1 = player;
        match_pool.game_type = game_type;
        match_pool.entry_fee = entry_fee;
        match_pool.status = MatchStatus::Waiting;
        match_pool.created_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    pub fn submit_score(
        ctx: Context<SubmitScore>,
        score: u32,
    ) -> Result<()> {
        let match_pool = &mut ctx.accounts.match_pool;
        let player = ctx.accounts.authority.key();

        require!(
            match_pool.status == MatchStatus::Active,
            ErrorCode::MatchNotActive
        );

        if match_pool.player1 == player {
            match_pool.player1_score = score;
        } else if match_pool.player2 == player {
            match_pool.player2_score = score;
        } else {
            return Err(ErrorCode::UnauthorizedPlayer.into());
        }

        Ok(())
    }

    pub fn settle_match(ctx: Context<SettleMatch>) -> Result<()> {
        let match_pool = &mut ctx.accounts.match_pool;
        let player1_profile = &mut ctx.accounts.player1_profile;
        let player2_profile = &mut ctx.accounts.player2_profile;

        require!(
            match_pool.status == MatchStatus::Active,
            ErrorCode::MatchNotActive
        );

        let winner = if match_pool.player1_score > match_pool.player2_score {
            player1_profile.wins += 1;
            player2_profile.losses += 1;
            player1_profile.xp += 100;
            player2_profile.xp += 10;
            match_pool.player1
        } else {
            player2_profile.wins += 1;
            player1_profile.losses += 1;
            player2_profile.xp += 100;
            player1_profile.xp += 10;
            match_pool.player2
        };

        player1_profile.total_matches += 1;
        player2_profile.total_matches += 1;

        // Update levels
        player1_profile.level = (player1_profile.xp / 1000) + 1;
        player2_profile.level = (player2_profile.xp / 1000) + 1;

        match_pool.winner = Some(winner);
        match_pool.status = MatchStatus::Completed;
        match_pool.ended_at = Some(Clock::get()?.unix_timestamp);

        Ok(())
    }

    pub fn submit_prediction(
        ctx: Context<SubmitPrediction>,
        prediction_type: PredictionType,
        prediction: String,
        stake: u64,
    ) -> Result<()> {
        let prediction_account = &mut ctx.accounts.prediction;
        
        if stake > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.authority.key(),
                &ctx.accounts.reward_vault.key(),
                stake,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.authority.to_account_info(),
                    ctx.accounts.reward_vault.to_account_info(),
                ],
            )?;
        }

        prediction_account.player = ctx.accounts.authority.key();
        prediction_account.prediction_type = prediction_type;
        prediction_account.prediction = prediction;
        prediction_account.stake = stake;
        prediction_account.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn claim_mystery_box(
        ctx: Context<ClaimMysteryBox>,
        box_type: BoxType,
    ) -> Result<()> {
        let player = &mut ctx.accounts.player_profile;
        let current_time = Clock::get()?.unix_timestamp;

        // Check cooldown for free box
        if box_type == BoxType::Free {
            require!(
                current_time - player.last_box_claim >= 86400,
                ErrorCode::BoxCooldownActive
            );
        }

        // Generate random rewards (simplified)
        let xp_reward = if box_type == BoxType::Free { 100 } else { 300 };
        player.xp += xp_reward;
        player.level = (player.xp / 1000) + 1;
        player.last_box_claim = current_time;

        Ok(())
    }

    pub fn update_streak(ctx: Context<UpdateStreak>) -> Result<()> {
        let player = &mut ctx.accounts.player_profile;
        let current_time = Clock::get()?.unix_timestamp;
        let time_diff = current_time - player.last_login;

        if time_diff < 86400 {
            // Same day, no change
            return Ok(());
        } else if time_diff < 172800 {
            // Next day, increment streak
            player.current_streak += 1;
            if player.current_streak > player.longest_streak {
                player.longest_streak = player.current_streak;
            }
        } else {
            // Missed a day, reset streak
            player.current_streak = 1;
        }

        player.last_login = current_time;
        Ok(())
    }
}

// Contexts
#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PlayerProfile::INIT_SPACE,
        seeds = [b"player", authority.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + MatchPool::INIT_SPACE
    )]
    pub match_pool: Account<'info, MatchPool>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Reward vault
    #[account(mut)]
    pub reward_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub match_pool: Account<'info, MatchPool>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    #[account(mut)]
    pub match_pool: Account<'info, MatchPool>,
    #[account(mut)]
    pub player1_profile: Account<'info, PlayerProfile>,
    #[account(mut)]
    pub player2_profile: Account<'info, PlayerProfile>,
}

#[derive(Accounts)]
pub struct SubmitPrediction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Prediction::INIT_SPACE
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Reward vault
    #[account(mut)]
    pub reward_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimMysteryBox<'info> {
    #[account(mut)]
    pub player_profile: Account<'info, PlayerProfile>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateStreak<'info> {
    #[account(mut)]
    pub player_profile: Account<'info, PlayerProfile>,
    pub authority: Signer<'info>,
}

// Accounts
#[account]
#[derive(InitSpace)]
pub struct PlayerProfile {
    pub authority: Pubkey,
    #[max_len(32)]
    pub username: String,
    pub xp: u64,
    pub level: u32,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub total_matches: u32,
    pub wins: u32,
    pub losses: u32,
    pub last_login: i64,
    pub last_box_claim: i64,
    pub created_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct MatchPool {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub game_type: GameType,
    pub entry_fee: u64,
    pub player1_score: u32,
    pub player2_score: u32,
    pub winner: Option<Pubkey>,
    pub status: MatchStatus,
    pub created_at: i64,
    pub ended_at: Option<i64>,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    pub player: Pubkey,
    pub prediction_type: PredictionType,
    #[max_len(64)]
    pub prediction: String,
    pub stake: u64,
    pub result: Option<bool>,
    pub created_at: i64,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameType {
    TapSpeed,
    Reaction,
    Trivia,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchStatus {
    Waiting,
    Active,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PredictionType {
    Price,
    Trivia,
    Fee,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum BoxType {
    Free,
    Premium,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Match is not active")]
    MatchNotActive,
    #[msg("Unauthorized player")]
    UnauthorizedPlayer,
    #[msg("Box cooldown is still active")]
    BoxCooldownActive,
}
