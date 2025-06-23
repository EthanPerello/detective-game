import { useState, useEffect } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import QuestioningRoom from './components/QuestioningRoom';
import ChatInterface from './components/ChatInterface';
import ResultScreen from './components/ResultScreen';
import { setupDojoProvider, checkKatanaConnection } from './dojo/setup';
import type { DojoProvider } from './types/dojo';
import axios from 'axios';

type GameState = 'home' | 'questioning' | 'chat' | 'result';

interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  gender: string;
}

interface ChatMessage {
  type: 'player' | 'character';
  message: string;
  timestamp: Date;
}

interface GameResult {
  won: boolean;
  accusedCharacter: number;
  characterName: string;
}

/* ========= NEW: base URL from env ========= */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
/* ========================================== */

function App() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [currentCaseId, setCurrentCaseId] = useState<number | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [dojoProvider, setDojoProvider] = useState<DojoProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMessage[]>>({});
  const [playerAddress] = useState<string>('0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec');
  const [katanaConnected, setKatanaConnected] = useState<boolean>(false);

  useEffect(() => {
    async function initDojo() {
      try {
        const katanaStatus = await checkKatanaConnection();
        setKatanaConnected(katanaStatus);

        const provider = await setupDojoProvider();
        setDojoProvider(provider);

        console.log(
          `Detective Game initialized with ${katanaStatus ? 'blockchain' : 'fallback'} mode`,
        );
      } catch (error) {
        console.error('Failed to initialize Dojo:', error);
        setKatanaConnected(false);
      }
    }
    initDojo();
  }, []);

  const startCase = async (caseId: number) => {
    setLoading(true);
    try {
      let newGameId: string;

      if (dojoProvider && katanaConnected) {
        try {
          console.log('Starting game on blockchain...');
          const blockchainGameId = await dojoProvider.actions.start_game();
          newGameId = blockchainGameId.toString();
        } catch (error) {
          console.error('Blockchain game start failed, using backend:', error);
          const { data } = await axios.post(`${BASE_URL}/api/game/start`, {
            playerAddress,
          });
          newGameId = data.gameId;
        }
      } else {
        const { data } = await axios.post(`${BASE_URL}/api/game/start`, {
          playerAddress,
        });
        newGameId = data.gameId;
      }

      setGameId(newGameId);
      setCurrentCaseId(caseId);
      setChatHistory({});
      setGameState('questioning');
    } catch (err) {
      console.error('Failed to start case:', err);
      setGameId(Date.now().toString());
      setCurrentCaseId(caseId);
      setChatHistory({});
      setGameState('questioning');
    } finally {
      setLoading(false);
    }
  };

  const selectCharacter = (character: Character) => {
    setCurrentCharacter(character);
    setGameState('chat');
  };

  const backToQuestioningRoom = () => {
    setCurrentCharacter(null);
    setGameState('questioning');
  };

  const backToHome = () => {
    setGameState('home');
    setCurrentCharacter(null);
    setCurrentCaseId(null);
    setGameId(null);
    setGameResult(null);
    setChatHistory({});
  };

  const makeAccusation = async (characterId: number, characterName: string) => {
    if (!gameId) return;
    setLoading(true);

    try {
      let isCorrect: boolean;

      if (dojoProvider && katanaConnected) {
        try {
          console.log('Making accusation on blockchain...');
          isCorrect = await dojoProvider.actions.make_accusation(gameId, characterId);
        } catch (error) {
          console.error('Blockchain accusation failed, using backend:', error);
          const { data } = await axios.post(`${BASE_URL}/api/game/accuse`, {
            gameId,
            characterId,
            playerAddress,
          });
          isCorrect = data.isCorrect;
        }
      } else {
        const { data } = await axios.post(`${BASE_URL}/api/game/accuse`, {
          gameId,
          characterId,
          playerAddress,
        });
        isCorrect = data.isCorrect;
      }

      setGameResult({ won: isCorrect, accusedCharacter: characterId, characterName });
      setGameState('result');
    } catch (err) {
      console.error('Failed to make accusation:', err);
      alert('Failed to make accusation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {!katanaConnected && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 text-sm z-50">
          Blockchain not connected – running in fallback mode (backend API)
        </div>
      )}

      <div className={katanaConnected ? '' : 'pt-10'}>
        {gameState === 'home' && (
          <HomePage onStartCase={startCase} blockchainConnected={katanaConnected} />
        )}

        {gameState === 'questioning' && currentCaseId && (
          <QuestioningRoom
            caseId={currentCaseId}
            gameId={gameId!}
            onSelectCharacter={selectCharacter}
            onAccuse={makeAccusation}
            onBack={backToHome}
            loading={loading}
          />
        )}

        {gameState === 'chat' && currentCharacter && (
          <ChatInterface
            character={currentCharacter}
            gameId={gameId!}
            onBack={backToQuestioningRoom}
            onAccuse={makeAccusation}
            loading={loading}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}

        {gameState === 'result' && gameResult && (
          <ResultScreen result={gameResult} onPlayAgain={backToHome} />
        )}
      </div>
    </div>
  );
}

export default App;
