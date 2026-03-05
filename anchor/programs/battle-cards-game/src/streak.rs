use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct StreakState {
    pub user: Pubkey,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub last_check_in: i64,
    pub total_check_ins: u32,
    pub pending_rewards: u64,
    pub last_reward_claimed: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StreakConfig {
    pub authority: Pubkey,
    pub reward_wallet: Pubkey,
    pub streak_5_reward: u64,   // Reward for 5 day streak
    pub streak_10_reward: u64,  // Reward for 10 day streak
    pub streak_20_reward: u64,  // Reward for 20 day streak
    pub check_in_window: i64,   // Time window for check-in (e.g., 28 hours)
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeStreak<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + StreakState::INIT_SPACE,
        seeds = [b"streak", user.key().as_ref()],
        bump
    )]
    pub streak_state: Account<'info, StreakState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeStreakConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StreakConfig::INIT_SPACE,
        seeds = [b"streak_config"],
        bump
    )]
    pub streak_config: Account<'info, StreakConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(
        mut,
        seeds = [b"streak", user.key().as_ref()],
        bump = streak_state.bump
    )]
    pub streak_state: Account<'info, StreakState>,
    #[account(
        seeds = [b"streak_config"],
        bump = streak_config.bump
    )]
    pub streak_config: Account<'info, StreakConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimStreakReward<'info> {
    #[account(
        mut,
        seeds = [b"streak", user.key().as_ref()],
        bump = streak_state.bump
    )]
    pub streak_state: Account<'info, StreakState>,
    #[account(
        seeds = [b"streak_config"],
        bump = streak_config.bump
    )]
    pub streak_config: Account<'info, StreakConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: Reward wallet that sends SOL to users
    #[account(
        mut,
        constraint = reward_wallet.key() == streak_config.reward_wallet
    )]
    pub reward_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_streak(ctx: Context<InitializeStreak>) -> Result<()> {
    let streak_state = &mut ctx.accounts.streak_state;
    streak_state.user = ctx.accounts.user.key();
    streak_state.current_streak = 0;
    streak_state.longest_streak = 0;
    streak_state.last_check_in = 0;
    streak_state.total_check_ins = 0;
    streak_state.pending_rewards = 0;
    streak_state.last_reward_claimed = 0;
    streak_state.bump = ctx.bumps.streak_state;
    
    msg!("Streak initialized for user: {}", ctx.accounts.user.key());
    Ok(())
}

pub fn initialize_streak_config(
    ctx: Context<InitializeStreakConfig>,
    reward_wallet: Pubkey,
) -> Result<()> {
    let streak_config = &mut ctx.accounts.streak_config;
    streak_config.authority = ctx.accounts.authority.key();
    streak_config.reward_wallet = reward_wallet;
    streak_config.streak_5_reward = 500_000;    // 0.0005 SOL
    streak_config.streak_10_reward = 1_000_000;  // 0.001 SOL
    streak_config.streak_20_reward = 2_500_000;  // 0.0025 SOL
    streak_config.check_in_window = 100800;      // 28 hours in seconds
    streak_config.bump = ctx.bumps.streak_config;
    
    msg!("Streak config initialized");
    Ok(())
}

pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
    let streak_state = &mut ctx.accounts.streak_state;
    let streak_config = &ctx.accounts.streak_config;
    let current_time = Clock::get()?.unix_timestamp;
    
    // First check-in
    if streak_state.last_check_in == 0 {
        streak_state.current_streak = 1;
        streak_state.longest_streak = 1;
        streak_state.last_check_in = current_time;
        streak_state.total_check_ins = 1;
        msg!("First check-in! Streak started: 1 day");
        return Ok(());
    }
    
    let time_since_last = current_time - streak_state.last_check_in;
    
    // Check if within valid window (24-28 hours)
    if time_since_last < 86400 {
        // Too soon (less than 24 hours)
        return Err(StreakError::CheckInTooSoon.into());
    } else if time_since_last <= streak_config.check_in_window {
        // Valid check-in window
        streak_state.current_streak += 1;
        streak_state.total_check_ins += 1;
        
        // Update longest streak
        if streak_state.current_streak > streak_state.longest_streak {
            streak_state.longest_streak = streak_state.current_streak;
        }
        
        // Check for milestone rewards
        let reward = match streak_state.current_streak {
            5 => streak_config.streak_5_reward,
            10 => streak_config.streak_10_reward,
            20 => streak_config.streak_20_reward,
            _ => 0,
        };
        
        if reward > 0 {
            streak_state.pending_rewards += reward;
            msg!("Milestone reached! {} day streak. Reward: {} lamports", 
                streak_state.current_streak, reward);
        }
        
        streak_state.last_check_in = current_time;
        msg!("Check-in successful! Current streak: {} days", streak_state.current_streak);
    } else {
        // Streak broken (more than 28 hours)
        msg!("Streak broken! Previous streak: {} days", streak_state.current_streak);
        streak_state.current_streak = 1;
        streak_state.last_check_in = current_time;
        streak_state.total_check_ins += 1;
    }
    
    Ok(())
}

pub fn claim_streak_reward(ctx: Context<ClaimStreakReward>) -> Result<()> {
    let streak_state = &mut ctx.accounts.streak_state;
    
    require!(
        streak_state.pending_rewards > 0,
        StreakError::NoRewardToClaim
    );
    
    let reward_amount = streak_state.pending_rewards;
    
    // Transfer SOL from reward wallet to user
    **ctx.accounts.reward_wallet.try_borrow_mut_lamports()? -= reward_amount;
    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += reward_amount;
    
    streak_state.pending_rewards = 0;
    streak_state.last_reward_claimed = Clock::get()?.unix_timestamp;
    
    msg!("Streak reward claimed: {} lamports", reward_amount);
    Ok(())
}

#[error_code]
pub enum StreakError {
    #[msg("Check-in too soon. Wait at least 24 hours between check-ins")]
    CheckInTooSoon,
    #[msg("No reward available to claim")]
    NoRewardToClaim,
}
