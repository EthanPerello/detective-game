#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage, ModelStorageTest};
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };

    use detective_game::systems::actions::{actions, IDetectiveGameDispatcher, IDetectiveGameDispatcherTrait};
    use detective_game::models::{Game, m_Game, Player, m_Player, Accusation, m_Accusation, GameStatus};

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "detective_game",
            resources: [
                TestResource::Model(m_Game::TEST_CLASS_HASH),
                TestResource::Model(m_Player::TEST_CLASS_HASH),
                TestResource::Model(m_Accusation::TEST_CLASS_HASH),
                TestResource::Event(actions::e_GameStarted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_AccusationMade::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
            ]
                .span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"detective_game", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"detective_game")].span())
        ]
            .span()
    }

    #[test]
    fn test_start_game() {
        // Initialize test environment
        let caller = starknet::contract_address_const::<0x123>();
        let ndef = namespace_def();

        // Register the resources.
        let mut world = spawn_test_world([ndef].span());

        // Ensures permissions and initializations are synced.
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IDetectiveGameDispatcher { contract_address };

        // Test starting a game
        starknet::testing::set_contract_address(caller);
        let game_id = actions_system.start_game();
        
        // Verify game was created
        let game: Game = world.read_model(game_id);
        assert(game.game_id == game_id, 'Wrong game ID');
        assert(game.player == caller, 'Wrong player');
        assert(game.status == GameStatus::Active, 'Game should be active');
        assert(!game.accusation_used, 'No accusation used yet');
        assert(game.accused_character == 0, 'No character accused yet');

        // Verify player stats updated
        let player: Player = world.read_model(caller);
        assert(player.games_played == 1, 'Wrong games played count');
        assert(player.current_game_id == game_id, 'Wrong current game ID');
    }

    #[test]
    fn test_correct_accusation() {
        // Setup world and deploy contract
        let caller = starknet::contract_address_const::<0x123>();
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());
        
        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IDetectiveGameDispatcher { contract_address };
        
        // Start game and make correct accusation (character 2 = David)
        starknet::testing::set_contract_address(caller);
        let game_id = actions_system.start_game();
        let result = actions_system.make_accusation(game_id, 2);
        
        // Verify correct accusation
        assert(result, 'Should be correct accusation');
        
        let game: Game = world.read_model(game_id);
        assert(game.status == GameStatus::Won, 'Game should be won');
        assert(game.accusation_used, 'Accusation should be used');
        assert(game.accused_character == 2, 'Character 2 should be accused');

        // Verify player stats updated
        let player: Player = world.read_model(caller);
        assert(player.games_won == 1, 'Should have 1 win');
        assert(player.current_game_id == 0, 'Should clear current game');
    }

    #[test]
    fn test_incorrect_accusation() {
        // Setup world and deploy contract
        let caller = starknet::contract_address_const::<0x123>();
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());
        
        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IDetectiveGameDispatcher { contract_address };
        
        // Start game and make incorrect accusation (character 1 = Sarah)
        starknet::testing::set_contract_address(caller);
        let game_id = actions_system.start_game();
        let result = actions_system.make_accusation(game_id, 1);
        
        // Verify incorrect accusation
        assert(!result, 'Should be incorrect accusation');
        
        let game: Game = world.read_model(game_id);
        assert(game.status == GameStatus::Lost, 'Game should be lost');
        assert(game.accusation_used, 'Accusation should be used');
        assert(game.accused_character == 1, 'Character 1 should be accused');

        // Verify player stats (no win added)
        let player: Player = world.read_model(caller);
        assert(player.games_won == 0, 'Should have 0 wins');
    }

    #[test]
    #[should_panic(expected: ('Already made accusation',))]
    fn test_double_accusation_fails() {
        // Setup world and deploy contract
        let caller = starknet::contract_address_const::<0x123>();
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());
        
        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = IDetectiveGameDispatcher { contract_address };
        
        // Start game and make two accusations (should fail)
        starknet::testing::set_contract_address(caller);
        let game_id = actions_system.start_game();
        actions_system.make_accusation(game_id, 1);
        actions_system.make_accusation(game_id, 2); // This should panic
    }
}