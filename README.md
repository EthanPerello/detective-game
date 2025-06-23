# Detective Game

A blockchain-first murder mystery game built with the Dojo Engine and powered by AI. Players interrogate suspects, gather clues, and make a one-time accusation to solve the case. Core game actions and progress are recorded on Starknet through provable onchain logic, while character dialogue is generated via AI off-chain.

This project was created for [Dojo Game Jam 6](https://github.com/dojoengine), submitted under the Full Game Track. It demonstrates how expressive AI interaction can complement onchain mechanics in a hybrid architecture.

---

## 🎮 Gameplay

- Interrogate 3 AI-powered suspects, each with unique personalities  
- Uncover clues through dynamic, GPT-driven conversations  
- Make a single accusation to solve the mystery  
- Permanent outcome is recorded onchain via smart contracts  
- Game includes rankings and case-tracking features  

---

## 🧱 Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS  
- **Backend**: Node.js, Express, OpenAI API (GPT-4o-mini)  
- **Blockchain**: Starknet + Dojo Engine (Katana + Torii)  
- **Hybrid Architecture**: Blockchain-first with off-chain AI integration fallback  

---

## 📦 Project Structure

```

.
├── assets/         # Game visuals (cover, icon)
├── backend/        # Express server + OpenAI integration
├── frontend/       # React-based game client
├── scripts/        # Dev helper scripts
├── src/            # Dojo smart contracts (Cairo)
├── dojo_dev.toml   # Dojo deployment config
├── Scarb.toml      # Cairo project config
├── LICENSE
├── README.md
└── ...

````

---

## ✅ Submission Details

- **Track**: Full Game Track  
- **World Address**: `0x0598cc6424eb59171928b1f7da3144c33a80ebe8f1f5c2e67ad9731b1e32e7f4`  
- **RPC URL**: `https://api.cartridge.gg/x/detective-game-6/katana`  
- **GitHub**: [github.com/EthanPerello/detective-game](https://github.com/EthanPerello/detective-game)  

---

## 🕹 How to Play Locally

### 🔐 API Key Setup (Required)

To use the AI-powered suspect chat, create a `.env` file in the `backend/` directory with:

```env
OPENAI_API_KEY=your-api-key-here
````

You can get an API key from: [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)

### Run the Game

```bash
# 1. Start the backend (AI logic)
cd backend
npm install
npm start

# 2. Start the frontend (game UI)
cd frontend
npm install
npm run dev
```

> Interrogate characters through chat, then make one final accusation. If connected to the blockchain, your game result is permanently recorded onchain.

---

## 🧠 Onchain Logic via Dojo

This project uses Dojo Engine (ECS for Starknet) to manage provable game state:

* `Player`: Tracks connected player sessions
* `Game`: Stores each game instance
* `Accusation`: Records the result of a player's accusation
* `Events`: Emit `GameStarted` and `AccusationMade` for indexing
* `Scarb.toml` structure for compiling Cairo contracts
* Deployed to Slot using `katana`, `torii`, and `sozo`

---

## 🔧 Known Limitations / In-Progress Fixes

Due to the game jam time constraints, the following items are in-progress or deferred:

* [ ] Add loading indicator during blockchain transactions
* [ ] Ensure all views are fully responsive and scrollable (especially chat)
* [ ] Improve blockchain-first logic and deprecate fallback handling
* [ ] More detailed character bios and case descriptions
* [ ] Deploy frontend to Vercel

---

## 🚀 Future Features & Roadmap

These features are planned post-jam to expand the game's depth and replayability:

* 🧩 Additional cases with branching narratives
* 🧠 AI-generated procedural cases
* 🕒 Solve-time tracking and global time-based stats
* 🎖 Tokenized case completions:

  * Unique reward NFTs for completing cases
  * Tiered rewards for solving multiple mysteries
* ❤️ “Like/Dislike” relationship meter with suspects
* 🔍 “Important clue” tracking system with visual alerts
* 🤝 Multiplayer Mode:

  * Each player chats with a suspect
  * Group reconvening phases before voting

---

## 👤 Created By

**Ethan Perello**

* 🌐 [ethanperello.github.io](https://ethanperello.github.io/)
* 💼 [linkedin.com/in/EthanPerello](http://linkedin.com/in/EthanPerello)
* 💻 [github.com/EthanPerello](https://github.com/EthanPerello)

---

## 🪙 License

Licensed under the [MIT License](./LICENSE).