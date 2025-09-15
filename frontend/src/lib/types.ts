export interface CandidateProfile {
  anonymousId: string;
  name: string;
  skills: string[];
  projects: string[];
  rawResumeText: string;
  sourceFilename: string;
  createdAt: string;
  updatedAt: string;
}

export interface GithubProject {
  id: string;
  anonymousId: string;
  repoUrl: string;
  repoFullName: string;
  name: string;
  description: string;
  technologies: string[];
  architectureLayers: string[];
  summary: string;
  commits: { sha: string; message: string; author: string; date: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export type InterviewMode = "technical" | "deep_dive" | "behavioral";

export interface Interview {
  id: string;
  anonymousId: string;
  mode: InterviewMode;
  role: string;
  experience: string;
  topicsToFocus: string;
  projectId: string | null;
  status: "active" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface InterviewMessage {
  id: string;
  interviewId: string;
  role: "interviewer" | "candidate";
  content: string;
  createdAt: string;
}
