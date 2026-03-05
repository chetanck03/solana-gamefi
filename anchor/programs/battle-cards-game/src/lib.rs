use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub mod quiz;
pub mod streak;

use quiz::*;
use streak::*;

declare_id!("GhESwjzEv3C3qKQJKjAfhaq5GFK5vDLaku8tPqCKGzYR");

#[program]
pub mod battle_cards_game {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>, username: String) -> Result<()> {
        let player = &mut ctx.accounts.player;
        player.authority = ctx.accounts.authority.key();
        player.username = username;
        player.xp = 0;
        player.level = 1;
        player.wins = 0;
        player.losses = 0;
        player.draws = 0;
        player.current_streak = 0;
        player.longest_streak = 0;
        player.total_matches = 0;
        player.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn purchase_fighter(
        ctx: Context<PurchaseFighter>,
        fighter_name: String,
        price: u64,
    ) -> Result<()> {
        let fighter_ownership = &mut ctx.accounts.fighter_ownership;
        fighter_ownership.owner = ctx.accounts.buyer.key();
        fighter_ownership.fighter_name = fighter_name.clone();
        fighter_ownership.purchased_at = Clock::get()?.unix_timestamp;
        fighter_ownership.price_paid = price;
        
        // Transfer SOL to treasury if price > 0
        if price > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.buyer.key(),
                &ctx.accounts.treasury.key(),
                price,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.buyer.to_account_info(),
                    ctx.accounts.treasury.to_account_info(),
                ],
            )?;
        }
        
        msg!("Fighter {} purchased for {} lamports", fighter_name, price);
        Ok(())
    }

    pub fn create_match(
        ctx: Context<CreateMatch>,
        entry_fee: u64,
        game_mode: GameMode,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        match_account.player1 = ctx.accounts.player1.key();
        match_account.player2 = Pubkey::default();
        match_account.entry_fee = entry_fee;
        match_account.game_mode = game_mode;
        match_account.status = MatchStatus::Waiting;
        match_account.winner = Pubkey::default();
        match_account.created_at = Clock::get()?.unix_timestamp;
        
        // Transfer entry fee to match escrow
        if entry_fee > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.player1.key(),
                &match_account.key(),
                entry_fee,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.player1.to_account_info(),
                    match_account.to_account_info(),
                ],
            )?;
        }
        
        Ok(())
    }

    pub fn join_match(ctx: Context<JoinMatch>) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        
        require!(
            match_account.status == MatchStatus::Waiting,
            ErrorCode::MatchNotWaiting
        );
        
        match_account.player2 = ctx.accounts.player2.key();
        match_account.status = MatchStatus::Active;
        
        // Transfer entry fee to match escrow
        if match_account.entry_fee > 0 {
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.player2.key(),
                &match_account.key(),
                match_account.entry_fee,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.player2.to_account_info(),
                    match_account.to_account_info(),
                ],
            )?;
        }
        
        Ok(())
    }

    pub fn complete_match(
        ctx: Context<CompleteMatch>,
        winner_key: Pubkey,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        
        require!(
            match_account.status == MatchStatus::Active,
            ErrorCode::MatchNotActive
        );
        
        require!(
            winner_key == match_account.player1 || winner_key == match_account.player2,
            ErrorCode::InvalidWinner
        );
        
        match_account.winner = winner_key;
        match_account.status = MatchStatus::Completed;
        
        // Determine if player1 is the winner
        let player1_wins = winner_key == match_account.player1;
        
        // Update player1 stats
        if player1_wins {
            ctx.accounts.player1.wins += 1;
            ctx.accounts.player1.total_matches += 1;
            ctx.accounts.player1.current_streak += 1;
            ctx.accounts.player1.xp += 100;
            
            if ctx.accounts.player1.current_streak > ctx.accounts.player1.longest_streak {
                ctx.accounts.player1.longest_streak = ctx.accounts.player1.current_streak;
            }
        } else {
            ctx.accounts.player1.losses += 1;
            ctx.accounts.player1.total_matches += 1;
            ctx.accounts.player1.current_streak = 0;
            ctx.accounts.player1.xp += 25;
        }
        
        // Update player2 stats
        if !player1_wins {
            ctx.accounts.player2.wins += 1;
            ctx.accounts.player2.total_matches += 1;
            ctx.accounts.player2.current_streak += 1;
            ctx.accounts.player2.xp += 100;
            
            if ctx.accounts.player2.current_streak > ctx.accounts.player2.longest_streak {
                ctx.accounts.player2.longest_streak = ctx.accounts.player2.current_streak;
            }
        } else {
            ctx.accounts.player2.losses += 1;
            ctx.accounts.player2.total_matches += 1;
            ctx.accounts.player2.current_streak = 0;
            ctx.accounts.player2.xp += 25;
        }
        
        // Transfer prize to winner (95% of pool, 5% stays as platform fee)
        if match_account.entry_fee > 0 {
            let total_pool = match_account.entry_fee * 2;
            let platform_fee = total_pool / 20; // 5%
            let prize = total_pool - platform_fee;
            
            let winner_account = if player1_wins {
                ctx.accounts.player1.to_account_info()
            } else {
                ctx.accounts.player2.to_account_info()
            };
            
            **match_account.to_account_info().try_borrow_mut_lamports()? -= prize;
            **winner_account.try_borrow_mut_lamports()? += prize;
            
            // Platform fee stays in match account (can be collected later)
        }
        
        Ok(())
    }

    // Quiz functions
    pub fn initialize_quiz(ctx: Context<InitializeQuiz>) -> Result<()> {
        quiz::initialize_quiz(ctx)
    }

    pub fn initialize_quiz_config(
        ctx: Context<InitializeQuizConfig>,
        reward_wallet: Pubkey,
        reward_amount: u64,
    ) -> Result<()> {
        quiz::initialize_quiz_config(ctx, reward_wallet, reward_amount)
    }

    pub fn submit_quiz(ctx: Context<SubmitQuiz>, all_correct: bool) -> Result<()> {
        quiz::submit_quiz(ctx, all_correct)
    }

    pub fn claim_quiz_reward(ctx: Context<ClaimQuizReward>) -> Result<()> {
        quiz::claim_quiz_reward(ctx)
    }

    // Streak functions
    pub fn initialize_streak(ctx: Context<InitializeStreak>) -> Result<()> {
        streak::initialize_streak(ctx)
    }

    pub fn initialize_streak_config(
        ctx: Context<InitializeStreakConfig>,
        reward_wallet: Pubkey,
    ) -> Result<()> {
        streak::initialize_streak_config(ctx, reward_wallet)
    }

    pub fn check_in(ctx: Context<CheckIn>) -> Result<()> {
        streak::check_in(ctx)
    }

    pub fn claim_streak_reward(ctx: Context<ClaimStreakReward>) -> Result<()> {
        streak::claim_streak_reward(ctx)
    }
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Player::INIT_SPACE,
        seeds = [b"player", authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(fighter_name: String)]
pub struct PurchaseFighter<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + FighterOwnership::INIT_SPACE,
        seeds = [b"fighter", buyer.key().as_ref(), fighter_name.as_bytes()],
        bump
    )]
    pub fighter_ownership: Account<'info, FighterOwnership>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Treasury account to receive payments
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateMatch<'info> {
    #[account(
        init,
        payer = player1,
        space = 8 + Match::INIT_SPACE
    )]
    pub match_account: Account<'info, Match>,
    #[account(mut)]
    pub player1: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, Match>,
    #[account(mut)]
    pub player2: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteMatch<'info> {
    #[account(mut)]
    pub match_account: Account<'info, Match>,
    #[account(mut)]
    pub player1: Account<'info, Player>,
    #[account(mut)]
    pub player2: Account<'info, Player>,
}

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub authority: Pubkey,
    #[max_len(32)]
    pub username: String,
    pub xp: u64,
    pub level: u8,
    pub wins: u32,
    pub losses: u32,
    pub draws: u32,
    pub current_streak: u32,
    pub longest_streak: u32,
    pub total_matches: u32,
    pub created_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct FighterOwnership {
    pub owner: Pubkey,
    #[max_len(32)]
    pub fighter_name: String,
    pub purchased_at: i64,
    pub price_paid: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Match {
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub entry_fee: u64,
    pub game_mode: GameMode,
    pub status: MatchStatus,
    pub winner: Pubkey,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameMode {
    Quick,
    Ranked,
    Tournament,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchStatus {
    Waiting,
    Active,
    Completed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Match is not in waiting status")]
    MatchNotWaiting,
    #[msg("Match is not active")]
    MatchNotActive,
    #[msg("Invalid winner")]
    InvalidWinner,
}
