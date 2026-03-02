# AI Co-Play

**This Is Not Just Another Game Lobby.**

AI Co-Play is a multi-game platform where AI acts as an **autonomous player** (teammate or rival), not a scripted bot and not a simple decision helper.

Built by `@lerenaminy`.

---

## Why This Project Exists

Most "play with AI" demos feel predictable because AI behavior is hard-coded or constrained by fixed difficulty presets.

AI Co-Play explores a different direction:

- AI receives **live game state** + **legal actions**
- AI chooses actions with its own reasoning
- Decisions are logged and visible in a **trace panel**
- The same architecture supports multiple game genres

This makes the project useful for:

- AI product demos
- game AI prototyping
- human-AI interaction experiments
- portfolio/showcase for applied LLM engineering

---

## What’s Implemented

### Game Modes

1. **Share or Steal** (`Competitive`)
2. **Overcooked Lite** (`Co-op`)
3. **Monopoly Lite** (`Strategy`)
4. **Liar Dice Lite** (`Hidden Info`)

### Core Features

- Autonomous AI move generation via Gemini
- Legal-action validation before applying moves
- Decision trace viewer (action, confidence, explanation)
- Session flow with end-game summary modal
- Modern UI/UX with responsive layout and animations

---

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **LLM:** Gemini 2.5 Flash API
- **Architecture Pattern:** Adapter-based game engine registry

---

## Project Structure

```text
app/
	page.tsx                 # Lobby / hero / game list
	game/[id]/page.tsx       # Main game room UI
	api/turn/route.ts        # AI turn endpoint

src/
	agent/gemini.ts          # LLM prompting + parsing + fallback
	game/                    # Engines + adapters + registry
	types/index.ts           # Shared types/interfaces
```

---

## Quick Start (Local Setup)

## 1) Prerequisites

Install these first:

- **Node.js**: v20+
- **npm**: v10+
- A **Gemini API key**

Check your versions:

```bash
node -v
npm -v
```

## 2) Clone the Repository

```bash
git clone https://github.com/lerenaminy/ai-co-play.git
cd ai-co-play
```

## 3) Install Dependencies

```bash
npm install
```

## 4) Run the App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 5) Add Your Gemini API Key

In the lobby page:

1. Find **Settings → Gemini API Key**
2. Paste your key
3. The key is stored in browser `localStorage`

Note: this project currently uses client-provided API key input (not `.env` setup).

---

## Build and Production Run

Create production build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

---

## How AI Decision Flow Works

1. User selects an action in the game UI
2. Frontend posts current `state` + `humanAction` to `/api/turn`
3. Server computes legal actions via game adapter
4. Gemini returns AI action JSON
5. Action is validated and applied
6. Decision trace is recorded and rendered

If model output is invalid, fallback selects a random legal move (non-deterministic), preserving autonomy without hardcoding one fixed action.

---

## Future Development (Contributions Welcome)

This project is actively open for improvement. Good next areas:

- More game environments and adapter templates
- Better agent memory/strategy across rounds
- Match replay and analytics dashboard
- Multiplayer rooms + spectator mode
- Deployment hardening and API key management strategy
- Evaluation suite for AI behavior quality

If you want to contribute, feel free to open issues or PRs.

---

## Contribution Guide

1. Fork this repository
2. Create a branch
3. Commit your changes
4. Push branch
5. Open a Pull Request

Commands:

```bash
git checkout -b feat/your-feature-name
git add .
git commit -m "feat: your feature summary"
git push origin feat/your-feature-name
```

---

## Troubleshooting

### `npm run dev` fails because port is already in use

```bash
lsof -i :3000 -i :3001 | grep node | awk '{print $2}' | xargs kill -9
```

Then run again:

```bash
npm run dev
```

### AI not responding

- Verify your Gemini API key is valid
- Confirm key is entered in lobby settings
- Check browser console and terminal logs for `/api/turn`

---

## License

Currently no explicit license file is included.

If you plan to open-source publicly, add a `LICENSE` file (MIT is a common choice for portfolio projects).
