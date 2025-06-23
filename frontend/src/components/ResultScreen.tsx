import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface GameResult {
  won: boolean;
  accusedCharacter: number;
  characterName: string;
}

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
}

interface RankingInfo {
  totalCompletions: number;
  playerRanking: number;
  hasCompleted: boolean;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onPlayAgain }) => {
  const [rankingInfo, setRankingInfo] = useState<RankingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankingInfo();
  }, []);

  const fetchRankingInfo = async () => {
    try {
      // In a real app, you'd get the actual player address
      const playerAddress = 'demo_player';
      const response = await axios.get(`http://localhost:3001/api/game/ranking/${playerAddress}`);
      setRankingInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch ranking info:', error);
      // Fallback data
      setRankingInfo({
        totalCompletions: 0,
        playerRanking: 0,
        hasCompleted: result.won
      });
    } finally {
      setLoading(false);
    }
  };

  const getCharacterImage = (characterId: number) => {
    switch (characterId) {
      case 1: return '/images/female-character.png'; // Sarah
      case 2: return '/images/male-character.png';   // David
      case 3: return '/images/female-character.png'; // Janet
      default: return '/images/default-character.png';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-6 text-center">
        <h1 className="text-3xl font-bold">Case Resolution</h1>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Character Image */}
          <div className="w-32 h-32 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src={getCharacterImage(result.accusedCharacter)}
              alt="Accused Character"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/default-character.png';
              }}
            />
          </div>

          {/* Result Message */}
          {result.won ? (
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 text-green-400">Case Solved!</h2>
              <p className="text-xl text-gray-300">
                Excellent work! You correctly identified {result.characterName} as the murderer.
              </p>
              <div className="mt-6 p-4 bg-green-900 rounded-lg">
                <h3 className="text-lg font-bold text-green-300 mb-2">The Truth Revealed</h3>
                <p className="text-green-200">
                  David, the IT Manager, discovered Marcus was embezzling company funds through fake IT contracts. 
                  When he confronted Marcus after the party, their argument escalated into a physical struggle. 
                  David grabbed the letter opener in what he claims was self-defense.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 text-red-400">Wrong Accusation</h2>
              <p className="text-xl text-gray-300">
                You accused {result.characterName}, but they were innocent. The case remains unsolved.
              </p>
              <div className="mt-6 p-4 bg-red-900 rounded-lg">
                <h3 className="text-lg font-bold text-red-300 mb-2">The Real Culprit</h3>
                <p className="text-red-200">
                  The murderer was actually David, the IT Manager. He discovered Marcus's embezzlement scheme 
                  and confronted him after the party. Their confrontation turned deadly when David grabbed 
                  the letter opener during the struggle.
                </p>
              </div>
            </div>
          )}

          {/* Ranking Info */}
          {rankingInfo && (
            <div className="mb-8 bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Detective Rankings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{rankingInfo.totalCompletions}</div>
                  <div className="text-sm text-gray-400">Total Completions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {rankingInfo.hasCompleted ? `#${rankingInfo.playerRanking}` : 'Unranked'}
                  </div>
                  <div className="text-sm text-gray-400">Your Ranking</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {result.won ? '🏆' : '❌'}
                  </div>
                  <div className="text-sm text-gray-400">This Case</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onPlayAgain}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded text-xl font-bold transition-colors"
            >
              {result.won ? 'Solve Another Case' : 'Try Again'}
            </button>
            
            <p className="text-center text-sm text-gray-400 mt-4">
              Return to the case selection screen to start a new investigation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;