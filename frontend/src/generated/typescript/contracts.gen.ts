import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_makeAccusation_calldata = (gameId: BigNumberish, characterId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "make_accusation",
			calldata: [gameId, characterId],
		};
	};

	const actions_makeAccusation = async (snAccount: Account | AccountInterface, gameId: BigNumberish, characterId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_makeAccusation_calldata(gameId, characterId),
				"detective_game",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_startGame_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "start_game",
			calldata: [],
		};
	};

	const actions_startGame = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_startGame_calldata(),
				"detective_game",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			makeAccusation: actions_makeAccusation,
			buildMakeAccusationCalldata: build_actions_makeAccusation_calldata,
			startGame: actions_startGame,
			buildStartGameCalldata: build_actions_startGame_calldata,
		},
	};
}