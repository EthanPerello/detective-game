require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { getCharacterResponse } = require('./characters');

const app = express();
const PORT = process.env.PORT || 3001;

// Check if API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  console.log('Current working directory:', process.cwd());
  console.log('Looking for .env file at:', __dirname + '/.env');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory storage for demo (use a real database in production)
const gameStats = {
  totalAttempts: 0,
  totalCompletions: 0,
  playerCompletions: new Set(), // Track unique players who completed
  completionOrder: [], // Track order of completions for ranking
  playerStats: new Map() // Track individual player stats
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Detective Game Backend is running',
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Get all cases endpoint with global stats
app.get('/api/cases', (req, res) => {
  const playerAddress = req.query.player || 'unknown';
  const playerStat = gameStats.playerStats.get(playerAddress) || { attempts: 0, completed: false };
  
  const cases = [
    {
      id: 1,
      title: "The Office Party Murder",
      description: "Marcus Thompson, the company CEO, has been found dead in his office after the holiday party. Three suspects remain in the building.",
      difficulty: "Medium",
      estimatedTime: "15-25 minutes",
      attempts: gameStats.totalAttempts,
      completions: gameStats.totalCompletions,
      successRate: gameStats.totalAttempts > 0 ? (gameStats.totalCompletions / gameStats.totalAttempts) * 100 : 0,
      playerCompleted: playerStat.completed,
      playerAttempts: playerStat.attempts
    }
  ];
  res.json(cases);
});

// Get specific case endpoint
app.get('/api/cases/:id', (req, res) => {
  const caseId = parseInt(req.params.id);
  const playerAddress = req.query.player || 'unknown';
  const playerStat = gameStats.playerStats.get(playerAddress) || { attempts: 0, completed: false };
  
  if (caseId === 1) {
    const caseData = {
      id: 1,
      title: "The Office Party Murder",
      description: "Marcus Thompson, the company CEO, has been found dead in his office after the holiday party. Three suspects remain in the building. As the detective, you must question each suspect and determine who committed the murder.",
      victim: "Marcus Thompson (CEO)",
      location: "Company Office",
      time: "After Holiday Party",
      weapon: "Letter Opener",
      difficulty: "Medium",
      estimatedTime: "15-25 minutes",
      attempts: gameStats.totalAttempts,
      completions: gameStats.totalCompletions,
      successRate: gameStats.totalAttempts > 0 ? (gameStats.totalCompletions / gameStats.totalAttempts) * 100 : 0,
      playerCompleted: playerStat.completed,
      playerAttempts: playerStat.attempts
    };
    res.json(caseData);
  } else {
    res.status(404).json({ error: 'Case not found' });
  }
});

// Start game endpoint (track attempts)
app.post('/api/game/start', (req, res) => {
  const { playerAddress } = req.body;
  const playerId = playerAddress || 'unknown';
  
  // Increment total attempts
  gameStats.totalAttempts++;
  
  // Update player stats
  const playerStat = gameStats.playerStats.get(playerId) || { attempts: 0, completed: false };
  playerStat.attempts++;
  gameStats.playerStats.set(playerId, playerStat);
  
  const gameId = Date.now().toString();
  
  res.json({
    success: true,
    gameId: gameId,
    totalAttempts: gameStats.totalAttempts
  });
});

// Make accusation endpoint (track completions and ranking)
app.post('/api/game/accuse', (req, res) => {
  const { gameId, characterId, playerAddress } = req.body;
  const playerId = playerAddress || 'unknown';
  
  // David (character 2) is the correct answer
  const isCorrect = characterId === 2;
  let ranking = 0;
  
  if (isCorrect) {
    // Increment total completions
    gameStats.totalCompletions++;
    
    // Add to completion order for ranking
    if (!gameStats.playerCompletions.has(playerId)) {
      gameStats.completionOrder.push({
        playerId: playerId,
        timestamp: Date.now(),
        completionNumber: gameStats.totalCompletions
      });
      gameStats.playerCompletions.add(playerId);
      
      // Update player stats
      const playerStat = gameStats.playerStats.get(playerId) || { attempts: 0, completed: false };
      playerStat.completed = true;
      gameStats.playerStats.set(playerId, playerStat);
    }
    
    // Get player's ranking (when they first completed it)
    const playerCompletion = gameStats.completionOrder.find(completion => completion.playerId === playerId);
    if (playerCompletion) {
      ranking = playerCompletion.completionNumber;
    }
  }
  
  res.json({
    success: true,
    isCorrect: isCorrect,
    totalCompletions: gameStats.totalCompletions,
    playerRanking: ranking,
    correctAnswer: isCorrect ? null : 2 // Don't reveal correct answer if wrong
  });
});

// Get ranking info
app.get('/api/game/ranking/:player', (req, res) => {
  const playerId = req.params.player;
  const playerCompletion = gameStats.completionOrder.find(completion => completion.playerId === playerId);
  
  res.json({
    totalCompletions: gameStats.totalCompletions,
    playerRanking: playerCompletion ? playerCompletion.completionNumber : 0,
    hasCompleted: !!playerCompletion
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { characterId, message, gameId } = req.body;

    if (!characterId || !message) {
      return res.status(400).json({ error: 'Character ID and message are required' });
    }

    // Get character response using OpenAI
    const response = await getCharacterResponse(openai, characterId, message, gameId);
    
    res.json({ 
      success: true, 
      response: response,
      characterId: characterId 
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Get character info endpoint
app.get('/api/characters/:id', (req, res) => {
  const characterId = parseInt(req.params.id);
  
  const characters = {
    1: {
      id: 1,
      name: "Sarah",
      role: "Executive Assistant",
      description: "The victim's nervous assistant who had access to the office",
      gender: "female"
    },
    2: {
      id: 2,
      name: "David",
      role: "IT Manager", 
      description: "The defensive tech expert who was in the office late",
      gender: "male"
    },
    3: {
      id: 3,
      name: "Janet",
      role: "HR Director",
      description: "The professional HR manager who handles company conflicts",
      gender: "female"
    }
  };

  const character = characters[characterId];
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }

  res.json(character);
});

// Get all characters endpoint
app.get('/api/characters', (req, res) => {
  const characters = [
    {
      id: 1,
      name: "Sarah",
      role: "Executive Assistant",
      description: "The victim's nervous assistant who had access to the office",
      gender: "female"
    },
    {
      id: 2,
      name: "David", 
      role: "IT Manager",
      description: "The defensive tech expert who was in the office late",
      gender: "male"
    },
    {
      id: 3,
      name: "Janet",
      role: "HR Director", 
      description: "The professional HR manager who handles company conflicts",
      gender: "female"
    }
  ];

  res.json(characters);
});

// Get global stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    totalAttempts: gameStats.totalAttempts,
    totalCompletions: gameStats.totalCompletions,
    successRate: gameStats.totalAttempts > 0 ? (gameStats.totalCompletions / gameStats.totalAttempts) * 100 : 0,
    uniqueCompletions: gameStats.playerCompletions.size,
    recentCompletions: gameStats.completionOrder.slice(-10) // Last 10 completions
  });
});

app.listen(PORT, () => {
  console.log(`🕵️ Detective Game Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`📊 Stats tracking initialized`);
});