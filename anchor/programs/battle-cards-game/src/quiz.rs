use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct QuizState {
    pub user: Pubkey,
    pub last_attempt: i64,
    pub total_attempts: u32,
    pub correct_attempts: u32,
    pub last_reward_claimed: i64,
    pub pending_reward: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct QuizConfig {
    pub authority: Pubkey,
    pub reward_wallet: Pubkey,
    pub reward_amount: u64, // 0.001 SOL = 1_000_000 lamports
    pub cooldown_period: i64, // 24 hours in seconds
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeQuiz<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + QuizState::INIT_SPACE,
        seeds = [b"quiz", user.key().as_ref()],
        bump
    )]
    pub quiz_state: Account<'info, QuizState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeQuizConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + QuizConfig::INIT_SPACE,
        seeds = [b"quiz_config"],
        bump
    )]
    pub quiz_config: Account<'info, QuizConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitQuiz<'info> {
    #[account(
        mut,
        seeds = [b"quiz", user.key().as_ref()],
        bump = quiz_state.bump
    )]
    pub quiz_state: Account<'info, QuizState>,
    #[account(
        seeds = [b"quiz_config"],
        bump = quiz_config.bump
    )]
    pub quiz_config: Account<'info, QuizConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimQuizReward<'info> {
    #[account(
        mut,
        seeds = [b"quiz", user.key().as_ref()],
        bump = quiz_state.bump
    )]
    pub quiz_state: Account<'info, QuizState>,
    #[account(
        seeds = [b"quiz_config"],
        bump = quiz_config.bump
    )]
    pub quiz_config: Account<'info, QuizConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: Reward wallet that sends SOL to users
    #[account(
        mut,
        constraint = reward_wallet.key() == quiz_config.reward_wallet
    )]
    pub reward_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_quiz(ctx: Context<InitializeQuiz>) -> Result<()> {
    let quiz_state = &mut ctx.accounts.quiz_state;
    quiz_state.user = ctx.accounts.user.key();
    quiz_state.last_attempt = 0;
    quiz_state.total_attempts = 0;
    quiz_state.correct_attempts = 0;
    quiz_state.last_reward_claimed = 0;
    quiz_state.pending_reward = 0;
    quiz_state.bump = ctx.bumps.quiz_state;
    
    msg!("Quiz initialized for user: {}", ctx.accounts.user.key());
    Ok(())
}

pub fn initialize_quiz_config(
    ctx: Context<InitializeQuizConfig>,
    reward_wallet: Pubkey,
    reward_amount: u64,
) -> Result<()> {
    let quiz_config = &mut ctx.accounts.quiz_config;
    quiz_config.authority = ctx.accounts.authority.key();
    quiz_config.reward_wallet = reward_wallet;
    quiz_config.reward_amount = reward_amount;
    quiz_config.cooldown_period = 86400; // 24 hours
    quiz_config.bump = ctx.bumps.quiz_config;
    
    msg!("Quiz config initialized with reward: {} lamports", reward_amount);
    Ok(())
}

pub fn submit_quiz(ctx: Context<SubmitQuiz>, all_correct: bool) -> Result<()> {
    let quiz_state = &mut ctx.accounts.quiz_state;
    let quiz_config = &ctx.accounts.quiz_config;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check cooldown period (24 hours)
    require!(
        current_time - quiz_state.last_attempt >= quiz_config.cooldown_period,
        QuizError::CooldownNotExpired
    );
    
    quiz_state.last_attempt = current_time;
    quiz_state.total_attempts += 1;
    
    if all_correct {
        quiz_state.correct_attempts += 1;
        quiz_state.pending_reward += quiz_config.reward_amount;
        msg!("Quiz completed successfully! Reward added: {} lamports", quiz_config.reward_amount);
    } else {
        msg!("Quiz completed but not all answers were correct");
    }
    
    Ok(())
}

pub fn claim_quiz_reward(ctx: Context<ClaimQuizReward>) -> Result<()> {
    let quiz_state = &mut ctx.accounts.quiz_state;
    
    require!(
        quiz_state.pending_reward > 0,
        QuizError::NoRewardToClaim
    );
    
    let reward_amount = quiz_state.pending_reward;
    
    // Transfer SOL from reward wallet to user
    **ctx.accounts.reward_wallet.try_borrow_mut_lamports()? -= reward_amount;
    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += reward_amount;
    
    quiz_state.pending_reward = 0;
    quiz_state.last_reward_claimed = Clock::get()?.unix_timestamp;
    
    msg!("Reward claimed: {} lamports", reward_amount);
    Ok(())
}

#[error_code]
pub enum QuizError {
    #[msg("Cooldown period has not expired. Try again in 24 hours")]
    CooldownNotExpired,
    #[msg("No reward available to claim")]
    NoRewardToClaim,
}
