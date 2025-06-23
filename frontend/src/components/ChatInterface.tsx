import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

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

interface ChatInterfaceProps {
  character: Character;
  gameId: string;
  onBack: () => void;
  onAccuse: (characterId: number, characterName: string) => void;
  loading: boolean;
  chatHistory: Record<number, ChatMessage[]>;
  setChatHistory: React.Dispatch<React.SetStateAction<Record<number, ChatMessage[]>>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  character,
  gameId,
  onBack,
  onAccuse,
  loading,
  chatHistory,
  setChatHistory
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat history for this character
  const messages = chatHistory[character.id] || [
    {
      type: 'character',
      message: `Hello detective. I'm ${character.name}, the ${character.role}. I'll help however I can with your investigation.`,
      timestamp: new Date()
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateChatHistory = (newMessages: ChatMessage[]) => {
    setChatHistory(prev => ({
      ...prev,
      [character.id]: newMessages
    }));
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const playerMessage: ChatMessage = {
      type: 'player',
      message: currentMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, playerMessage];
    updateChatHistory(newMessages);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        characterId: character.id,
        message: currentMessage,
        gameId: gameId
      });

      const characterResponse: ChatMessage = {
        type: 'character',
        message: response.data.response,
        timestamp: new Date()
      };

      updateChatHistory([...newMessages, characterResponse]);
    } catch (error) {
      console.error('Failed to get character response:', error);
      
      const fallbackResponse: ChatMessage = {
        type: 'character',
        message: "I... I'm not sure what to say about that.",
        timestamp: new Date()
      };
      updateChatHistory([...newMessages, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAccuse = () => {
    if (window.confirm(`Are you sure you want to accuse ${character.name} of murder? This is your only accusation!`)) {
      onAccuse(character.id, character.name);
    }
  };

  const getCharacterImage = () => {
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

  const useSuggestedQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const getSuggestedQuestions = () => {
    // Character-specific suggested questions
    const baseQuestions = [
      "Where were you when Marcus was killed?",
      "What was your relationship with Marcus like?",
      "Did you see anything suspicious that night?",
      "Why were you still at the office so late?"
    ];

    const characterSpecificQuestions: Record<number, string[]> = {
      1: [ // Sarah
        "As his assistant, did Marcus seem worried about anything lately?",
        "Who had access to Marcus's office?",
        "Did you notice any conflicts between Marcus and the staff?"
      ],
      2: [ // David
        "What IT work were you doing that night?",
        "Did Marcus ever ask you about company security?",
        "Have you noticed any unusual computer activity?"
      ],
      3: [ // Janet
        "Were there any HR complaints about Marcus recently?",
        "Did any employees seem upset with Marcus?",
        "What company policies might be relevant to this case?"
      ]
    };

    return [...baseQuestions, ...(characterSpecificQuestions[character.id] || [])];
  };

  const getCharacterMoodColor = () => {
    // Subtle visual cues based on character personality
    switch (character.id) {
      case 1: // Sarah - nervous
        return 'border-yellow-600/30';
      case 2: // David - defensive
        return 'border-gray-600/30';
      case 3: // Janet - professional
        return 'border-blue-600/30';
      default:
        return 'border-gray-600';
    }
  };

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
          <h1 className="text-3xl font-bold">Interrogation - {character.name}</h1>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Panel - Character Info */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Character Profile */}
          <div className="p-6 border-b border-gray-700">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 ${getCharacterMoodColor()}`}>
                <img 
                  src={getCharacterImage()}
                  alt={`${character.name} - ${character.gender} ${character.role}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-character.png';
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-1">{character.name}</h2>
              <p className="text-gray-400 font-medium mb-2">{character.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{character.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-700">
            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Back to Room
              </button>
              
              <button
                onClick={handleAccuse}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                {loading ? 'Processing...' : 'Accuse of Murder'}
              </button>
            </div>
          </div>

          {/* Investigation Tips */}
          <div className="p-6 flex-1">
            <h3 className="font-semibold mb-3 text-yellow-400">Investigation Tips</h3>
            <div className="bg-gray-700 p-4 rounded-lg text-sm space-y-2">
              <div>Look for contradictions in their story</div>
              <div>Pay attention to evasive answers</div>
              <div>Notice defensive behavior patterns</div>
              <div>Ask follow-up questions for clarity</div>
              <div>Press them on specific details</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-2/3 bg-gray-900 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 chat-scroll">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.type === 'player' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-md ${
                    msg.type === 'player'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  <span className="text-xs opacity-70 block mt-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm">{character.name} is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 2 && (
            <div className="px-6 py-4 border-t border-gray-700 bg-gray-800">
              <p className="text-sm text-gray-400 mb-3 font-medium">Suggested questions for {character.name}:</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {getSuggestedQuestions().map((question, index) => (
                  <button
                    key={index}
                    onClick={() => useSuggestedQuestion(question)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-gray-700 bg-gray-800">
            <div className="flex space-x-4">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your question for ${character.name}...`}
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white resize-none border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows={2}
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={isTyping || !currentMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg transition-colors font-bold"
              >
                {isTyping ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;