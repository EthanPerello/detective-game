import { Account, RpcProvider, CallData } from 'starknet';
import type { DojoProvider } from '../types/dojo';

// World address - updated to your deployed world
const WORLD_ADDRESS = "0x0598cc6424eb59171928b1f7da3144c33a80ebe8f1f5c2e67ad9731b1e32e7f4";

// Actions contract address - from sozo inspect
const ACTIONS_CONTRACT_ADDRESS = "0x0177bc5f0f156a6bbe78093c11a1ba48cce97a8160ef84cf6c32349b1422eeea";

// Update to use your Slot account credentials
const SLOT_ACCOUNT_ADDRESS = "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec";
const SLOT_PRIVATE_KEY = "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912";

export async function setupDojoProvider(): Promise<DojoProvider> {
  // Setup Starknet provider pointing to your Slot deployment
  const provider = new RpcProvider({
    nodeUrl: "https://api.cartridge.gg/x/detective-game-6/katana"
  });

  // Setup account
  const account = new Account(provider, SLOT_ACCOUNT_ADDRESS, SLOT_PRIVATE_KEY);

  // Contract interactions
  const actions = {
    async start_game(): Promise<number> {
      try {
        console.log('Starting game on blockchain...');
        console.log('Actions contract address:', ACTIONS_CONTRACT_ADDRESS);
        
        // Call start_game directly on the deployed actions contract
        const result = await account.execute({
          contractAddress: ACTIONS_CONTRACT_ADDRESS,
          entrypoint: 'start_game',
          calldata: []
        });

        console.log('Game started transaction:', result.transaction_hash);
        
        // Wait for transaction to be accepted
        await provider.waitForTransaction(result.transaction_hash);
        
        const gameId = Date.now();
        console.log('Game started successfully, ID:', gameId);
        return gameId;
      } catch (error) {
        console.error('Error starting game on blockchain:', error);
        throw error;
      }
    },

    async make_accusation(gameId: string, characterId: number): Promise<boolean> {
      try {
        console.log(`Making accusation on blockchain: Game ${gameId}, Character ${characterId}`);
        console.log('Actions contract address:', ACTIONS_CONTRACT_ADDRESS);

        // Call make_accusation directly on the deployed actions contract
        const result = await account.execute({
          contractAddress: ACTIONS_CONTRACT_ADDRESS,
          entrypoint: 'make_accusation',
          calldata: CallData.compile([parseInt(gameId), characterId])
        });

        console.log('Accusation transaction:', result.transaction_hash);
        await provider.waitForTransaction(result.transaction_hash);
        
        const isCorrect = characterId === 2;
        console.log('Accusation result:', isCorrect);
        return isCorrect;
      } catch (error) {
        console.error('Error making accusation on blockchain:', error);
        throw error;
      }
    }
  };

  return {
    provider,
    account,
    worldAddress: WORLD_ADDRESS,
    actions
  };
}

// Helper function to check if Slot is reachable
export async function checkKatanaConnection(): Promise<boolean> {
  try {
    const provider = new RpcProvider({
      nodeUrl: "https://api.cartridge.gg/x/detective-game-6/katana"
    });
    await provider.getChainId();
    console.log('Slot connection successful');
    return true;
  } catch (error) {
    console.error('Slot not reachable:', error);
    return false;
  }
}

// Helper function to read game state from blockchain
export async function readGameState(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider: RpcProvider, 
  gameId: string
): Promise<any> {
  try {
    console.log(`Reading game state for game ${gameId}`);
    // TODO: Implement actual game state reading from contracts
    return null;
  } catch (error) {
    console.error('Error reading game state:', error);
    return null;
  }
}

// Helper function to read player stats from blockchain
export async function readPlayerStats(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider: RpcProvider, 
  playerAddress: string
): Promise<any> {
  try {
    console.log(`Reading player stats for ${playerAddress}`);
    // TODO: Implement actual player stats reading from contracts
    return {
      games_won: 0,
      games_played: 0,
      current_game_id: 0
    };
  } catch (error) {
    console.error('Error reading player stats:', error);
    return {
      games_won: 0,
      games_played: 0,
      current_game_id: 0
    };
  }
}