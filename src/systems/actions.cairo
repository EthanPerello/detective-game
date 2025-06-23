// Define the game interface
#[starknet::interface]
pub trait IDetectiveGame<T> {
    fn start_game(ref self: T) -> u32;
    fn make_accusation(ref self: T, game_id: u32, character_id: u8) -> bool;
}

// Dojo contract
#[dojo::contract]
pub mod actions {
    use super::IDetectiveGame;
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use detective_game::models::{Game, Player, Accusation, GameStatus, is_murderer};
    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    // Events
    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameStarted {
        #[key]
        pub game_id: u32,
        pub player: ContractAddress,
        pub timestamp: u64,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct AccusationMade {
        #[key]
        pub game_id: u32,
        pub player: ContractAddress,
        pub accused_character: u8,
        pub is_correct: bool,
        pub timestamp: u64,
    }

    #[abi(embed_v0)]
    impl DetectiveGameImpl of IDetectiveGame<ContractState> {
        fn start_game(ref self: ContractState) -> u32 {
            let mut world = self.world_default();
            let player = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Get or create player record
            let mut player_record: Player = world.read_model(player);
            
            // Generate game ID (simple incremental ID based on games played)
            let game_id = player_record.games_played + 1;
            
            // Create new game
            let game = Game {
                game_id,
                player,
                status: GameStatus::Active,
                accusation_used: false,
                accused_character: 0,
                started_at: timestamp,
            };
            
            // Update player stats
            player_record.games_played += 1;
            player_record.current_game_id = game_id;
            
            // Write to world
            world.write_model(@game);
            world.write_model(@player_record);
            
            // Emit event
            world.emit_event(@GameStarted { game_id, player, timestamp });
            
            game_id
        }

        fn make_accusation(ref self: ContractState, game_id: u32, character_id: u8) -> bool {
            let mut world = self.world_default();
            let player = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Read game state
            let mut game: Game = world.read_model(game_id);
            
            // Validate game
            assert(game.player == player, 'Not your game');
            assert(game.status == GameStatus::Active, 'Game not active');
            assert(!game.accusation_used, 'Already made accusation');
            assert(character_id >= 1 && character_id <= 3, 'Invalid character');
            
            // Check if accusation is correct
            let is_correct = is_murderer(character_id);
            
            // Update game state
            game.accusation_used = true;
            game.accused_character = character_id;
            game.status = if is_correct { GameStatus::Won } else { GameStatus::Lost };
            
            // Create accusation record
            let accusation = Accusation {
                game_id,
                player,
                accused_character_id: character_id,
                is_correct,
                timestamp,
            };
            
            // Update player stats if won
            if is_correct {
                let mut player_record: Player = world.read_model(player);
                player_record.games_won += 1;
                player_record.current_game_id = 0; // Clear current game
                world.write_model(@player_record);
            }
            
            // Write to world
            world.write_model(@game);
            world.write_model(@accusation);
            
            // Emit event
            world.emit_event(@AccusationMade { 
                game_id, 
                player, 
                accused_character: character_id, 
                is_correct, 
                timestamp 
            });
            
            is_correct
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Use the default namespace "detective_game"
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"detective_game")
        }
    }
}