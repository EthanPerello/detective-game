import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


interface Case {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  attempts: number;
  completions: number;
  successRate: number;
  playerCompleted: boolean;
  playerAttempts: number;
}

interface HomePageProps {
  onStartCase: (caseId: number) => void;
  blockchainConnected?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onStartCase, blockchainConnected = false }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/cases`, {
            params: { player: 'demo_player' } // In a real app, get from wallet
      });
      setCases(response.data);
      if (response.data.length > 0) {
        setSelectedCase(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      // Fallback data
      const fallbackCases = [{
        id: 1,
        title: "The Office Party Murder",
        description: "Marcus Thompson, the company CEO, has been found dead in his office after the holiday party. Three suspects remain in the building. As the detective, you must question each suspect and determine who committed the murder.",
        difficulty: "Medium",
        estimatedTime: "15-25 minutes",
        attempts: 0,
        completions: 0,
        successRate: 0,
        playerCompleted: false,
        playerAttempts: 0
      }];
      setCases(fallbackCases);
      setSelectedCase(fallbackCases[0]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/images/detective-badge.png" 
              alt="Detective Badge" 
              className="w-10 h-10 mr-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold">Detective Game</h1>
              <p className="text-gray-300 mt-1">Solve mysterious crimes by questioning AI-powered suspects</p>
            </div>
          </div>
          
          {/* Blockchain Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${blockchainConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-sm font-medium">
              {blockchainConnected ? 'Blockchain Connected' : 'API Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex flex-1">
        {/* Left Panel - Case List */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Available Cases</h2>
            <p className="text-gray-400 text-sm mt-1">Select a case to view details</p>
          </div>
          
          <div className="p-4 flex-1">
            {cases.map((caseItem) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                className={`p-4 rounded-lg cursor-pointer transition-all mb-3 border ${
                  selectedCase?.id === caseItem.id
                    ? 'bg-blue-600 border-blue-400'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                    <p className={`text-sm mt-1 font-medium ${getDifficultyColor(caseItem.difficulty)}`}>
                      Difficulty: {caseItem.difficulty}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{caseItem.estimatedTime}</p>
                  </div>
                  {caseItem.playerCompleted && (
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold ml-3">
                      SOLVED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Case Details */}
        <div className="w-2/3 bg-gray-900 flex flex-col">
          {selectedCase ? (
            <>
              {/* Case Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src="/images/detective-badge.png" 
                      alt="Case File" 
                      className="w-6 h-6 mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <h2 className="text-2xl font-bold">{selectedCase.title}</h2>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getDifficultyColor(selectedCase.difficulty)} bg-gray-800`}>
                    {selectedCase.difficulty}
                  </span>
                </div>
              </div>

              {/* Case Content - Scrollable */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">Case Description</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedCase.description}</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Case Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">Case Details</h3>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className={getDifficultyColor(selectedCase.difficulty)}>{selectedCase.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Time:</span>
                        <span>{selectedCase.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Suspects:</span>
                        <span>3 Individuals</span>
                      </div>
                    </div>
                  </div>

                  {/* Your Progress */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-400">Your Progress</h3>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Attempts:</span>
                        <span className="font-bold">{selectedCase.playerAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={selectedCase.playerCompleted ? 'text-green-400 font-bold' : 'text-red-400'}>
                          {selectedCase.playerCompleted ? 'Solved' : 'Unsolved'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Score:</span>
                        <span>{selectedCase.playerCompleted ? 'Case Solved' : 'Not Yet'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Statistics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">Global Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                      <div className="text-2xl font-bold text-blue-400">{selectedCase.attempts}</div>
                      <div className="text-sm text-gray-400">Total Attempts</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                      <div className="text-2xl font-bold text-green-400">{selectedCase.completions}</div>
                      <div className="text-sm text-gray-400">Cases Solved</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                      <div className="text-2xl font-bold text-yellow-400">
                        {selectedCase.attempts > 0 
                          ? Math.round(selectedCase.successRate)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-400">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-800">
                <button
                  onClick={() => onStartCase(selectedCase.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-bold transition-colors"
                >
                  {selectedCase.playerCompleted ? 'Play Again' : 'Start Investigation'}
                </button>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {blockchainConnected 
                    ? 'Game state will be recorded on the blockchain'
                    : 'Statistics tracked via backend API'
                  }
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center text-gray-400">
                <img 
                  src="/images/detective-badge.png" 
                  alt="No Case Selected" 
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p>Select a case to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;