// Character profiles for the detective game
const CHARACTERS = {
    1: {
      name: "Sarah",
      role: "Executive Assistant",
      personality: "Nervous, helpful, easily flustered when accused",
      baseInfo: [
        "I was Marcus's assistant for 3 years",
        "I had access to his office and knew his schedule", 
        "We had a disagreement about my workload recently",
        "I saw someone near his office around the time it happened"
      ],
      secrets: [
        "I saw David going into Marcus's office alone after the party",
        "Marcus had been acting strange lately, paranoid about something",
        "I heard Marcus on a phone call about 'covering tracks'"
      ],
      guilty: false
    },
    
    2: {
      name: "David", 
      role: "IT Manager",
      personality: "Defensive, technical, feels underappreciated, becomes hostile when pressured",
      baseInfo: [
        "I manage all the company's IT systems and security",
        "I was working late that night on server maintenance", 
        "Marcus never appreciated my technical expertise",
        "I have access to all office areas for IT support"
      ],
      secrets: [
        "I discovered Marcus was embezzling company funds through fake IT contracts",
        "I confronted him about it after the party when everyone left",
        "He threatened to fire me and destroy my career if I reported it",
        "We got into a physical fight and I grabbed the letter opener in self-defense"
      ],
      guilty: true
    },
  
    3: {
      name: "Janet",
      role: "HR Director", 
      personality: "Professional, diplomatic, careful about confidentiality",
      baseInfo: [
        "I handle all employee relations and company policies",
        "I was aware of some workplace tensions recently",
        "Marcus consulted me about some personnel issues",
        "I left the party early to handle a family emergency"
      ],
      secrets: [
        "Marcus had asked me about procedures for reporting financial irregularities",
        "David had been acting stressed and requested time off recently", 
        "Sarah had complained about Marcus being more demanding lately",
        "I knew Marcus was planning to make some major announcements soon"
      ],
      guilty: false
    }
  };
  
  // Generate character response using OpenAI
  async function getCharacterResponse(openai, characterId, playerMessage, _gameId) {
    const character = CHARACTERS[characterId];
    
    if (!character) {
      throw new Error('Invalid character ID');
    }
  
    // Build system prompt based on character
    const systemPrompt = `You are ${character.name}, a ${character.role} being questioned about your boss Marcus Thompson's murder at the company holiday party. 
  
  PERSONALITY: ${character.personality}
  
  BASIC INFORMATION YOU CAN SHARE:
  ${character.baseInfo.map(info => `- ${info}`).join('\n')}
  
  SECRET INFORMATION (only reveal under pressure or with good rapport):
  ${character.secrets.map(secret => `- ${secret}`).join('\n')}
  
  ${character.guilty ? 
    `YOU ARE GUILTY. You killed Marcus but don't want to confess. Be defensive and try to redirect suspicion.` :
    `YOU ARE INNOCENT. You want to help find the real killer but protect yourself from false accusations.`
  }
  
  INSTRUCTIONS:
  - Stay in character at all times
  - Start with basic information, only reveal secrets if the detective is skilled
  - Be defensive if directly accused (especially if innocent)
  - Keep responses to 2-3 sentences maximum
  - Don't volunteer information too easily - make the detective work for it
  - If accused and you're innocent, show appropriate offense and suspicion
  - If guilty, be evasive and defensive without obvious tells`;
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: playerMessage }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });
  
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Fallback responses if OpenAI fails
      const fallbackResponses = {
        1: "I... I don't know what to say. This is all so overwhelming.",
        2: "Look, I just do my job. I don't know anything about this.",
        3: "I think we should handle this matter through proper channels."
      };
      
      return fallbackResponses[characterId] || "I'd rather not discuss this right now.";
    }
  }
  
  module.exports = {
    getCharacterResponse,
    CHARACTERS
  };