// Prompt-template functions. Each one returns a plain string fed directly to
// Groq via services/groqClient.js. Kept as plain functions (no
// LangChain/agent framework) per the lightweight-orchestration decision.
//
// NOTE: every prompt here must ask for a top-level JSON *object*, not a bare
// array — Groq's (and OpenAI's) JSON mode rejects/misbehaves on a top-level
// array. Wrap arrays in a named key instead (see questionAnswerPrompt).

const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
    You are an AI trained to generate technical interview questions and answers.

    Task:
    - Role: ${role}
    - Candidate Experience: ${experience} years
    - Focus Topics: ${topicsToFocus}
    - Write ${numberOfQuestions} interview questions.
    - For each question, generate a detailed but beginner-friendly answer.
    - If the answer needs a code example, add a small code block inside.
    - Keep formatting very clean.
    - Return a pure JSON object like:
    {
        "questions": [
            {
                "question": "Question here?",
                "answer": "Answer here."
            },
            ...
        ]
    }
    Important: Do NOT add any extra text. Only return valid JSON.
`;

const conceptExplainPrompt = (question) => `
    You are an AI trained to generate explanations for a given interview question.

    Task:
    - Explain the following interview question and its concept in depth as if you're teaching a beginner developer.
    - Question: "${question}"
    - After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
    - If the explanation includes a code example, provide a small code block.
    - Keep the formatting very clean and clear.
    - Return the result as a valid JSON object in the following format:
    {
        "title": "Short title here?",
        "explanation": "Explanation here."
    }
    Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
`;

const resumeExtractionPrompt = (resumeText) => `
    You are an AI trained to extract structured candidate information from resume text.

    Task:
    - Read the raw resume text below (extracted from a PDF, so spacing/line breaks may be imperfect).
    - Extract the candidate's name, technical skills, and named projects.
    - "skills" should be specific technologies, languages, and frameworks — not soft skills.
    - "projects" should be actual named projects, products, or repositories mentioned — not job titles or companies.
    - If a field can't be confidently determined, use an empty string (for name) or empty array (for skills/projects). Do not invent information that isn't in the text.

    Resume text:
    """
    ${resumeText}
    """

    Return a pure JSON object like:
    {
        "name": "Candidate name here",
        "skills": ["Skill1", "Skill2"],
        "projects": ["ProjectName1", "ProjectName2"]
    }
    Important: Do NOT add any extra text. Only return valid JSON.
`;

const githubProjectSummaryPrompt = (repoFullName, readme, fileList, dependencyFile) => `
    You are an AI trained to analyze a GitHub repository and summarize its architecture.

    Task:
    - Repository: ${repoFullName}
    - Identify the main technologies, languages, and frameworks used — specific names only (e.g. "FastAPI", "PostgreSQL"), not generic terms like "backend" or "database".
    - Identify the architecture as an ordered array of short layer/component labels, in a top-to-bottom or request-flow order (e.g. ["Frontend", "Backend API", "ML Pipeline", "Database"]). Base this on the actual file structure and dependencies below, not assumptions.
    - Write a 1-2 sentence summary of what the project does, in plain language.
    - If the evidence is too thin to confidently determine something, use an empty array or a short honest summary rather than inventing detail.

    README:
    """
    ${(readme || "(no README found)").slice(0, 4000)}
    """

    File list (${fileList.length} files analyzed):
    ${fileList.join(", ") || "(none found)"}

    ${dependencyFile ? `Dependency file (${dependencyFile.path}):\n"""\n${dependencyFile.content}\n"""` : "(no dependency manifest found)"}

    Return a pure JSON object like:
    {
        "technologies": ["Tech1", "Tech2"],
        "architectureLayers": ["Layer1", "Layer2"],
        "summary": "Short summary here."
    }
    Important: Do NOT add any extra text. Only return valid JSON.
`;

const MODE_INSTRUCTIONS = {
    technical: "Ask questions about algorithms, system design, architecture, and debugging scenarios appropriate for the role and experience level. Do not reference a specific personal project unless the candidate brings one up themselves.",
    deep_dive: "You have reviewed the candidate's actual GitHub repository (context provided below, pulled from their real README and source files). Ask specific, pointed questions about real design decisions, tradeoffs, and architecture choices visible in that code — the way a real interviewer who actually read the code would. Reference specific technologies or files from the context when relevant.",
    behavioral: "Ask a behavioral question about a professional engineering experience, in a way that invites a STAR-format answer (Situation, Task, Action, Result) without requiring the candidate to know that acronym. Do not ask technical or coding questions in this mode.",
};

const interviewOpeningPrompt = ({ mode, role, experience, topicsToFocus, projectContext }) => `
    You are an experienced technical interviewer conducting a ${mode.replace("_", " ")} interview.

    Candidate:
    - Target role: ${role}
    - Experience: ${experience || "unspecified"} years
    - Focus topics: ${topicsToFocus || "general software engineering"}

    Mode instructions: ${MODE_INSTRUCTIONS[mode]}

    ${projectContext ? `Project context (from the candidate's actual repository):\n"""\n${projectContext}\n"""` : ""}

    Task: Ask your opening interview question. Sound like a real interviewer opening a conversation — natural, one question, not a numbered list or a preamble.

    Return a pure JSON object like:
    {
        "question": "Your opening question here."
    }
    Important: Do NOT add any extra text. Only return valid JSON.
`;

const interviewFollowUpPrompt = ({ mode, transcript, projectContext }) => `
    You are an experienced technical interviewer conducting a ${mode.replace("_", " ")} interview.

    Mode instructions: ${MODE_INSTRUCTIONS[mode]}

    ${projectContext ? `Project context (from the candidate's actual repository):\n"""\n${projectContext}\n"""` : ""}

    Conversation so far:
    """
    ${transcript}
    """

    Task: Based on the candidate's most recent answer, ask ONE natural follow-up question. React genuinely to specifics in their answer where possible — probe deeper on something interesting, vague, or debatable, the way a real interviewer would. Keep it to a single question, no preamble.

    Return a pure JSON object like:
    {
        "question": "Your follow-up question here."
    }
    Important: Do NOT add any extra text. Only return valid JSON.
`;

// Phase 5 prompt builder will be added here:
//   - feedbackScoringPrompt(transcript)

module.exports = {
    questionAnswerPrompt,
    conceptExplainPrompt,
    resumeExtractionPrompt,
    githubProjectSummaryPrompt,
    interviewOpeningPrompt,
    interviewFollowUpPrompt,
};
