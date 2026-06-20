# Nalarupa: AI-Powered Educational Visual Aid Generator

Nalarupa streamlines the creation of educational visuals for K-12 and vocational teachers by converting curriculum text into clear, safe, and engaging diagrams using AI. Teachers enter abstract textbook content and select a style—Nalarupa handles visual generation, persistence, and gallery curation, enabling educators to focus on teaching, not manual image searching or prompt engineering.

---

## 🚀 Quick Start Guide

Follow these steps to get a local development instance of Nalarupa running on your machine.

### Prerequisites

Ensure you have the following installed or prepared before continuing:
- **[Node.js](https://nodejs.org/)** (v18.x or higher recommended) and **[npm](https://www.npmjs.com/)** (or Yarn)
- **[Git](https://git-scm.com/)** (for version control)
- **API Key**: An active Google Gemini API key (required for text optimization and SFW filtering).
- *(Optional)* **[Docker](https://www.docker.com/)** & **[Docker Compose](https://docs.docker.com/compose/)** (if you prefer running the app via containers).

---

### Step 1: Clone the Repository

Clone the project to your local machine and navigate into the root directory:

```bash
git clone https://github.com/yogaswara/nalarupa.git
cd nalarupa
```

---

### Step 2: Set Up the Backend

The backend is powered by **ExpressJS** and uses **SQLite** for metadata persistence.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the backend dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and fill in your API keys (see [Environment Variables](#environment-variables) below for details). For a quick start without paid API keys, you can configure it to use free/mock modes if available, or input your standard Gemini/Pollinations configurations.

5. Run the database migration/initialization script to set up the SQLite database:
   ```bash
   npm run db:init
   ```
   *(Note: If the app automatically initializes the database on startup, you can skip this step and go straight to starting the server).*

6. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend should now be running, typically on `http://localhost:5011`.

---

### Step 3: Set Up the Frontend

The frontend is a modern **React** application.

1. Open a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Create your frontend environment file:
   ```bash
   cp .env.example .env
   ```

4. Verify that the API URL points to your backend:
   ```env
   VITE_API_URL=http://localhost:5011
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend should now be accessible at `http://localhost:5173` (or the port specified in your terminal).

---

## 🐳 Running with Docker

As an alternative to manual installation, you can run Nalarupa using Docker and Docker Compose. This starts both the frontend and backend services in containerized environments.

### Prerequisites

- [Docker](https://www.docker.com/) installed and running
- [Docker Compose](https://docs.docker.com/compose/)

### Steps

1. **Configure Environment Variables**
   Ensure you have created the `.env` files in both the `backend/` and `frontend/` directories as detailed in the [Environment Variables](#-environment-variables) section below.

2. **Start the Application**
   Run the following command in the root directory:
   ```bash
   docker compose up --build
   ```

3. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5011](http://localhost:5011)

4. **Stop the Application**
   To stop the containers and services, run:
   ```bash
   docker compose down
   ```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory with the following keys:

| Variable               | Description                                                           | Example / Default                                    | Required?                                      |
| :--------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------- | :--------------------------------------------- |
| `PORT`                 | The port the backend server runs on                                   | `5011`                                               | Optional (defaults to 5011)                    |
| `DATABASE_URL`         | SQLite database file path                                             | `sqlite://./database.sqlite` or `./data/nalarupa.db` | Optional                                       |
| `AI_PROVIDER`          | The AI provider to use (`gemini` or `pollinations`)                   | `gemini`                                             | Optional (defaults to `gemini` if key present) |
| `GEMINI_API_KEY`       | Gemini API key for curriculum-to-prompt optimization and SFW checking | `AIzaSy...`                                          | **Yes** (if using Gemini LLM features)         |
| `POLLINATIONS_API_URL` | Image generator endpoint (if custom)                                  | `https://gen.pollinations.ai/image/`                 | Optional                                       |
| `POLLINATIONS_API_KEY` | Optional API key for Pollinations (removes rate limits)               | `sk_...`                                             | Optional                                       |
| `NODE_ENV`             | Environment mode                                                      | `development`                                        | Optional                                       |

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend/` directory with the following keys:

| Variable                | Description                                                                         | Example / Default       | Required? |
| :---------------------- | :---------------------------------------------------------------------------------- | :---------------------- | :-------- |
| `VITE_API_URL`          | The base URL of the backend API                                                     | `http://localhost:5011` | **Yes**   |
| `VITE_API_PROXY_TARGET` | The base URL of the backend API used by the Vite dev proxy for `/v1` and `/uploads` | `http://localhost:5011` | **Yes**   |

---

## 🛠️ Project Structure

```text
nalarupa/
├── backend/                  # Clean Architecture
│   ├── data/                 # SQLite database storage
│   ├── src/
│   │   ├── domain/           # Core entities & repository interfaces
│   │   ├── usecases/         # Application-specific business rules
│   │   ├── interfaces/       # Adapters (controllers, routes, middlewares)
│   │   └── infrastructure/   # DB connection, external services (LLM, Image API), config
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 # Reactive, Defensive & Component-Based (Feature-Sliced)
│   ├── src/
│   │   ├── assets/           # Static files
│   │   ├── components/       # Global isolated UI components (common, layout)
│   │   ├── features/         # Feature-based modules (e.g., generation, gallery)
│   │   │   ├── [feature]/
│   │   │   │   ├── components/ # Feature-specific UI components
│   │   │   │   ├── hooks/      # Feature-specific reactive state management
│   │   │   │   └── utils/      # Defensive checks, validators
│   │   ├── hooks/            # Global custom hooks (e.g., polling, API fetching)
│   │   ├── services/         # API integrations, defensive boundaries/interceptors
│   │   ├── store/            # Global reactive state (Zustand, Redux, Context)
│   │   ├── utils/            # Global helpers, validation schemas (Zod/Yup)
│   │   ├── pages/            # Top-level page compositions
│   │   ├── App.jsx           # Main layout & container
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml        # Docker orchestration
├── .env.example
├── .gitignore
└── README.md                 # This guide
```

---

## 🎯 Key Features Covered

1. **AI Visual Generation**:
   - Paste curriculum text (up to 1,000 characters).
   - Choose a style preset:
     - **Edu-Cartoon**: Perfect for primary/elementary schools, friendly and colorful.
     - **Technical Diagram**: Structured, labeled, ideal for vocational/high school science and tech.
     - **Historical Sketch**: Monochrome/vintage style for social studies, history, or literature.
   - Behind the scenes, the backend uses an LLM (Gemini) to optimize the prompt for the chosen style and strictly enforces Safe-for-Work (SFW) requirements before sending it to the image generator (e.g., Pollinations.ai).

2. **Async Orchestration & Polling**:
   - Submissions trigger an async background job returning a unique `taskId`.
   - The frontend displays stepwise status states (e.g., `Queueing` ➜ `Analyzing Text` ➜ `Generating Visual`).
   - The UI disables the submit button during active generations, but remains fully responsive for browsing.

3. **Persistent Chronological Gallery**:
   - Generated images and metadata (original curriculum text, optimized prompt, timestamp) are stored server-side.
   - The gallery automatically loads images chronologically on page load and persists them across browser refreshes or device changes.

---

## 🛡️ Safety & Privacy

- **Safe-for-Work (SFW)**: All prompts are sanitized via an LLM filter prior to image generation to ensure classroom safety.
- **Privacy Compliant**: No personal student or teacher information is logged. Only curriculum text inputs and their corresponding generated images are stored.
