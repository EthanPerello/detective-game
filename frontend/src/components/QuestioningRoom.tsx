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
    if (window.confirm(`Are you sure you want to accuse ${character.name} of murder? This is your only accusation!`)) {
      onAccuse(character.id, character.name);
    }
  };

  if (charactersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading suspects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
        <div className="flex items-center">
          <img 
            src="/images/detective-badge.png" 
            alt="Detective Badge" 
            className="w-8 h-8 mr-3"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold">Questioning Room</h1>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Panel - Case Information */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Back Button */}
          <div className="p-6 border-b border-gray-700">
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Back to Cases
            </button>
          </div>

          {/* Case Information */}
          <div className="p-6 flex-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <img 
                  src="/images/detective-badge.png" 
                  alt="Case File" 
                  className="w-5 h-5 mr-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <h2 className="text-xl font-bold">Case Information</h2>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-yellow-400">The Office Party Murder</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Marcus Thompson, the company CEO, has been found dead in his office after the holiday party. Three suspects remain in the building.
                </p>
              </div>
            </div>

            {/* Evidence */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-blue-400">Evidence</h3>
              <div className="bg-gray-700 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Victim:</span>
                  <span>Marcus Thompson (CEO)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span>Company Office</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span>After Holiday Party</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weapon:</span>
                  <span>Letter Opener</span>
                </div>
              </div>
            </div>

            {/* Investigation Rules */}
            <div>
              <h3 className="font-semibold mb-3 text-red-400">Investigation Rules</h3>
              <div className="bg-red-900 border border-red-700 p-4 rounded-lg text-sm space-y-1">
                <div>Question each suspect carefully</div>
                <div>Look for contradictions and evasive behavior</div>
                <div>You only get ONE accusation attempt</div>
                <div>Choose wisely - the killer is among them</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Suspects */}
        <div className="w-2/3 bg-gray-900 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold">Suspects</h2>
            <p className="text-gray-400 mt-1">Three suspects remain in the building. Question them to uncover the truth.</p>
          </div>
          
          {/* Characters Display */}
          <div className="p-8 flex-1">
            <div className="flex justify-center items-center space-x-12 h-full">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="flex flex-col items-center text-center max-w-48"
                >
                  {/* Character Image */}
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden mb-4 border-2 border-gray-600">
                    <img 
                      src={getCharacterImage(character)}
                      alt={`${character.name} - ${character.gender}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-character.png';
                      }}
                    />
                  </div>

                  {/* Character Details */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1">{character.name}</h3>
                    <p className="text-sm text-gray-400 font-medium mb-2">{character.role}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{character.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 w-full">
                    <button
                      onClick={() => onSelectCharacter(character)}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Question
                    </button>
                    <button
                      onClick={() => handleAccuse(character)}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      {loading ? 'Processing...' : 'Accuse'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom instruction */}
            {/* Bottom instruction */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Click "Question" to interrogate a suspect or "Accuse" to make your final accusation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestioningRoom;