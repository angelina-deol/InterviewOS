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

// Phase 3+ prompt builders will be added here as each agent is built:
//   - githubProjectSummaryPrompt(readme, fileTree, sampleCode)
//   - jobDescriptionAnalysisPrompt(jobDescriptionText)
//   - interviewFollowUpPrompt(conversationHistory, projectContext)
//   - feedbackScoringPrompt(question, candidateAnswer)

module.exports = { questionAnswerPrompt, conceptExplainPrompt, resumeExtractionPrompt };
