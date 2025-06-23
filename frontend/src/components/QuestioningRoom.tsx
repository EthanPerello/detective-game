import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  gender: string;
}

interface QuestioningRoomProps {
  caseId: number;
  gameId: string;
  onSelectCharacter: (character: Character) => void;
  onAccuse: (characterId: number, characterName: string) => void;
  onBack: () => void;
  loading: boolean;
}

const QuestioningRoom: React.FC<QuestioningRoomProps> = ({
  caseId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gameId,
  onSelectCharacter,
  onAccuse,
  onBack,
  loading
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, [caseId]);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/characters');
      setCharacters(response.data);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
      // Fallback data with explicit gender assignments
      setCharacters([
        { id: 1, name: "Sarah", role: "Executive Assistant", description: "The victim's nervous assistant who had access to the office", gender: "female" },
        { id: 2, name: "David", role: "IT Manager", description: "The defensive tech expert who was in the office late", gender: "male" },
        { id: 3, name: "Janet", role: "HR Director", description: "The professional HR manager who handles company conflicts", gender: "female" }
      ]);
    } finally {
      setCharactersLoading(false);
    }
  };

  const getCharacterImage = (character: Character) => {
    // Explicit mapping to ensure correct images
    switch (character.id) {
      case 1: // Sarah
        return '/images/female-character.png';
      case 2: // David - ensure male image
        return '/images/male-character.png';
      case 3: // Janet
        return '/images/female-character.png';
      default:
        // Fallback to gender-based logic
        return character.gender === 'male' ? '/images/male-character.png' : '/images/female-character.png';
    }
  };

  const handleAccuse = (character: Character) => {
    if (window.confirm(`Are you sure you want to accuse ${character.name} of murder? This is your only chance!`)) {
      onAccuse(character.id, character.name);
    }
  };

  if (charactersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading suspects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
          >
            ← Back to Cases
          </button>
          <h1 className="text-3xl font-bold mb-2">Questioning Room</h1>
          <p className="text-gray-400 text-lg">Interview the suspects to solve the case. You only get ONE accusation!</p>
        </div>

        {/* Evidence Panel */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-4 text-yellow-400">📋 Case Evidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-400">Victim:</h3>
              <p>Marcus Thompson, Company CEO</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400">Location:</h3>
              <p>Corporate office after holiday party</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400">Weapon:</h3>
              <p>Letter opener from victim's desk</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400">Time:</h3>
              <p>Late evening, after most employees left</p>
            </div>
          </div>
        </div>

        {/* Characters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Suspects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <div className="text-center mb-4">
                  <img 
                    src={getCharacterImage(character)}
                    alt={character.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-600"
                    onError={(e) => {
                      e.currentTarget.src = character.gender === 'male' 
                        ? 'https://via.placeholder.com/96/4A5568/FFFFFF?text=M'
                        : 'https://via.placeholder.com/96/4A5568/FFFFFF?text=F';
                    }}
                  />
                  <h3 className="text-xl font-bold">{character.name}</h3>
                  <p className="text-blue-400">{character.role}</p>
                  <p className="text-sm text-gray-400 mt-2">{character.description}</p>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => onSelectCharacter(character)}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition-colors"
                  >
                    Question
                  </button>
                  <button
                    onClick={() => handleAccuse(character)}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2 px-4 rounded transition-colors"
                  >
                    {loading ? 'Processing...' : 'Accuse'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom instruction */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Click "Question" to interrogate a suspect or "Accuse" to make your final accusation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestioningRoom;