import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

// Type definition for `detective_game::models::Accusation` struct
export interface Accusation {
	game_id: BigNumberish;
	player: string;
	accused_character_id: BigNumberish;
	is_correct: boolean;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::models::AccusationValue` struct
export interface AccusationValue {
	accused_character_id: BigNumberish;
	is_correct: boolean;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::models::Game` struct
export interface Game {
	game_id: BigNumberish;
	player: string;
	status: GameStatusEnum;
	accusation_used: boolean;
	accused_character: BigNumberish;
	started_at: BigNumberish;
}

// Type definition for `detective_game::models::GameValue` struct
export interface GameValue {
	player: string;
	status: GameStatusEnum;
	accusation_used: boolean;
	accused_character: BigNumberish;
	started_at: BigNumberish;
}

// Type definition for `detective_game::models::Player` struct
export interface Player {
	player_address: string;
	games_won: BigNumberish;
	games_played: BigNumberish;
	current_game_id: BigNumberish;
}

// Type definition for `detective_game::models::PlayerValue` struct
export interface PlayerValue {
	games_won: BigNumberish;
	games_played: BigNumberish;
	current_game_id: BigNumberish;
}

// Type definition for `detective_game::systems::actions::actions::AccusationMade` struct
export interface AccusationMade {
	game_id: BigNumberish;
	player: string;
	accused_character: BigNumberish;
	is_correct: boolean;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::systems::actions::actions::AccusationMadeValue` struct
export interface AccusationMadeValue {
	player: string;
	accused_character: BigNumberish;
	is_correct: boolean;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::systems::actions::actions::GameStarted` struct
export interface GameStarted {
	game_id: BigNumberish;
	player: string;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::systems::actions::actions::GameStartedValue` struct
export interface GameStartedValue {
	player: string;
	timestamp: BigNumberish;
}

// Type definition for `detective_game::models::GameStatus` enum
export const gameStatus = [
	'Active',
	'Won',
	'Lost',
] as const;
export type GameStatus = { [key in typeof gameStatus[number]]: string };
export type GameStatusEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	detective_game: {
		Accusation: Accusation,
		AccusationValue: AccusationValue,
		Game: Game,
		GameValue: GameValue,
		Player: Player,
		PlayerValue: PlayerValue,
		AccusationMade: AccusationMade,
		AccusationMadeValue: AccusationMadeValue,
		GameStarted: GameStarted,
		GameStartedValue: GameStartedValue,
	},
}
export const schema: SchemaType = {
	detective_game: {
		Accusation: {
			game_id: 0,
			player: "",
			accused_character_id: 0,
			is_correct: false,
			timestamp: 0,
		},
		AccusationValue: {
			accused_character_id: 0,
			is_correct: false,
			timestamp: 0,
		},
		Game: {
			game_id: 0,
			player: "",
		status: new CairoCustomEnum({ 
					Active: "",
				Won: undefined,
				Lost: undefined, }),
			accusation_used: false,
			accused_character: 0,
			started_at: 0,
		},
		GameValue: {
			player: "",
		status: new CairoCustomEnum({ 
					Active: "",
				Won: undefined,
				Lost: undefined, }),
			accusation_used: false,
			accused_character: 0,
			started_at: 0,
		},
		Player: {
			player_address: "",
			games_won: 0,
			games_played: 0,
			current_game_id: 0,
		},
		PlayerValue: {
			games_won: 0,
			games_played: 0,
			current_game_id: 0,
		},
		AccusationMade: {
			game_id: 0,
			player: "",
			accused_character: 0,
			is_correct: false,
			timestamp: 0,
		},
		AccusationMadeValue: {
			player: "",
			accused_character: 0,
			is_correct: false,
			timestamp: 0,
		},
		GameStarted: {
			game_id: 0,
			player: "",
			timestamp: 0,
		},
		GameStartedValue: {
			player: "",
			timestamp: 0,
		},
	},
};
export enum ModelsMapping {
	Accusation = 'detective_game-Accusation',
	AccusationValue = 'detective_game-AccusationValue',
	Game = 'detective_game-Game',
	GameStatus = 'detective_game-GameStatus',
	GameValue = 'detective_game-GameValue',
	Player = 'detective_game-Player',
	PlayerValue = 'detective_game-PlayerValue',
	AccusationMade = 'detective_game-AccusationMade',
	AccusationMadeValue = 'detective_game-AccusationMadeValue',
	GameStarted = 'detective_game-GameStarted',
	GameStartedValue = 'detective_game-GameStartedValue',
}