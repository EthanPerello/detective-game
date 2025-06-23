use starknet::ContractAddress;

// Game status enum
#[derive(Copy, Drop, Serde, IntrospectPacked, PartialEq, Debug)]
pub enum GameStatus {
    Active,
    Won,
    Lost,
}

// Main game state
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u32,
    pub player: ContractAddress,
    pub status: GameStatus,
    pub accusation_used: bool,
    pub accused_character: u8, // 0 = no accusation yet
    pub started_at: u64,
}

// Player statistics
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Player {
    #[key]
    pub player_address: ContractAddress,
    pub games_won: u32,
    pub games_played: u32,
    pub current_game_id: u32,
}

// Accusation record
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Accusation {
    #[key]
    pub game_id: u32,
    #[key]
    pub player: ContractAddress,
    pub accused_character_id: u8,
    pub is_correct: bool,
    pub timestamp: u64,
}

// Helper function to check if character is the murderer
pub fn is_murderer(character_id: u8) -> bool {
    // In this MVP, character 2 (David) is always the murderer
    character_id == 2
}