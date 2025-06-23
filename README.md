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

## ✅ Live Demo

🎮 Play now (no setup required):  
👉 **[detective-game-iota.vercel.app](https://detective-game-iota.vercel.app)**

---

## 📦 Project Structure

```

.
├── assets/         # Game visuals (cover, icon)
├── backend/        # Express server + OpenAI integration
├── frontend/       # React-based game client
├── scripts/        # Dev helper scripts
├── src/            # Dojo smart contracts (Cairo)
├── dojo\_dev.toml   # Dojo deployment config
├── Scarb.toml      # Cairo project config
├── LICENSE
├── README.md
└── ...

````

---

## 🕹 How to Play Locally

### 🔐 API Key Setup

If you want to run the backend locally, create a `.env` file in the `backend/` directory with:

```env
OPENAI_API_KEY=your-api-key-here
````

Get a key at: [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)

### Run Locally

```bash
# Backend (AI logic)
cd backend
npm install
npm start

# Frontend (game UI)
cd frontend
npm install
npm run dev
```

---

## ⛓ Onchain Game State via Dojo

This project uses the Dojo Engine (ECS for Starknet) to manage provable game state:

* `Player`: Tracks connected player sessions
* `Game`: Stores each game instance
* `Accusation`: Records player accusations
* `Events`: Emits `GameStarted` and `AccusationMade` for indexing

Deployment powered by Katana (L2 devnet), Torii, and Sozo.

---

## 🔧 Known Limitations & Fixes in Progress

* [ ] Add loading indicators for blockchain interactions
* [ ] Improve mobile responsiveness (chat UI)
* [ ] Hide spoilers for incorrect accusations
* [ ] Expand bios and case variety
* [ ] Add Cartridge Controller integration

---

## 🚀 Planned Features

* 🧩 More cases with branching dialogue
* 🧠 Procedural case generation via AI
* 🕒 Solve-time rankings and stats
* 🎖 Reward NFTs for solving cases
* ❤️ Relationship meter with characters
* 🔍 Visual clue tracker
* 🤝 Multiplayer interrogation + voting

---

## 👤 Created By

**Ethan Perello**

* 🌐 [ethanperello.github.io](https://ethanperello.github.io/)
* 💼 [linkedin.com/in/EthanPerello](http://linkedin.com/in/EthanPerello)
* 💻 [github.com/EthanPerello](https://github.com/EthanPerello)

---

## 🪙 License

Licensed under the [MIT License](./LICENSE).