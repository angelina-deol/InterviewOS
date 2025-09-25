# InterviewOS

**An AI interviewer that's actually read your code.**

Most interview prep tools ask you generic questions off a list. InterviewOS is different — you give it a GitHub repo and a resume, and it builds a real technical interview around what you *actually built*: your architecture choices, your dependencies, your tradeoffs. Then it scores your answers and tells you what to work on.

---

## What it does

- **Upload a resume (PDF)** → parses it and extracts your skills and named projects
- **Paste a GitHub repo URL** → crawls the repo, reads the README + source files + commit history, and summarizes the tech stack and architecture
- **Start a mock interview** in one of three modes:
  - **Technical** — algorithms, system design, debugging
  - **Project Deep Dive** — questions grounded in a specific repo you analyzed, via RAG retrieval over the actual code
  - **Behavioral** — STAR-format questions about real experience
- **Get scored feedback** at the end — technical depth, communication, and confidence, plus concrete suggestions, not generic "practice more" advice

No login, no signup — it works anonymously per browser session, which is a deliberate constraint I'll talk about below.

## Architecture

                 User

                  |

                  v

          InterviewOS Backend

                  |

        ---------------------

        |          |        |

        v          v        v

 Resume  Agent  GitHub Agent  JD Agent

        \          |        /

          Candidate Knowledge Base

                    |

                    v

             Interview Agent

                    |

                    v

             Feedback Agent


The RAG pipeline (the part I'm most proud of):
1. Crawl a repo's README, source files, and commit history via the GitHub API
2. Chunk the text and embed each chunk **locally**, using a small transformer model that runs in-process — no external embeddings API, no per-embedding cost
3. Store embeddings in SQLite as JSON blobs (a real vector DB would be the production move, but for MVP scale a flat cosine-similarity scan over a few dozen chunks is genuinely fast enough, and it's one less service to run)
4. When the interview needs a follow-up question, embed the candidate's last answer and pull the most relevant chunks back out — so the AI's questions stay grounded in the actual code as the conversation moves around

## Why no login system

This was a deliberate scope decision, not a shortcut. Instead of full auth, every visitor gets an anonymous ID generated in their browser on first load, sent on every request, and used to scope every database query. No passwords to manage, no accounts table, but also no shared data between strangers — I tested this directly by simulating two different visitors and confirming neither could see, edit, or delete the other's sessions.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, TailwindCSS, Framer Motion |
| Backend | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |
| LLM | Groq (`openai/gpt-oss-120b`) |
| Embeddings | `@xenova/transformers`, running locally |
| GitHub integration | Octokit (GitHub REST API) |
| PDF parsing | `pdf-parse` |

## Running it locally

**Backend:**
```bash
cd Backend
npm install
cp .env.example .env
# add your GROQ_API_KEY (console.groq.com) and optionally GITHUB_TOKEN
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `localhost:3000`.

## What's not built yet

Being upfront about scope: job description matching and voice-based interviews (both in the original spec) aren't implemented. The feedback engine also currently scores a whole interview after the fact rather than giving live in-the-moment feedback. These were deliberate cuts to ship a focused MVP rather than half-finish everything.

