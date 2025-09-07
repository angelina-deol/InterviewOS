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
