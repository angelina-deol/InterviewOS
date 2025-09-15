const { Octokit } = require("@octokit/rest");

// GITHUB_TOKEN is optional — public repos work without one, but GitHub's
// unauthenticated rate limit is 60 requests/hour vs. 5,000/hour with a
// token. Worth setting for anything beyond occasional testing.
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN || undefined });

const EXCLUDED_DIR_SEGMENTS = [
    "node_modules/", ".git/", "dist/", "build/", "vendor/",
    "__pycache__/", ".next/", "coverage/", ".venv/", "venv/",
];
const CODE_EXTENSIONS = new Set([
    ".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".java", ".rb", ".php",
    ".c", ".cpp", ".h", ".hpp", ".cs", ".rs", ".swift", ".kt", ".md",
    ".json", ".yml", ".yaml",
]);
const PRIORITY_FILENAMES = new Set([
    "package.json", "requirements.txt", "go.mod", "pom.xml", "Cargo.toml",
]);
const MAX_FILES = 25;
const MAX_FILE_BYTES = 50_000; // skip unusually large files (generated code, data dumps)

/**
 * Accepts a full GitHub URL (any common variant: https, no-protocol,
 * www-prefixed, SSH-style, with trailing /tree/.. or /blob/.. paths, with
 * a ?tab=... query string or #readme hash from a browser copy-paste) or a
 * plain "owner/repo" shorthand.
 */
const parseGithubUrl = (input) => {
    let cleaned = input.trim();

    // Strip stray wrapping characters people sometimes paste along with a
    // link (markdown angle brackets, quotes copied from chat/docs).
    cleaned = cleaned.replace(/^[<"'\s]+|[>"'\s]+$/g, "");

    // Drop query string and hash fragment — very common when copying a URL
    // straight from the browser address bar (e.g. "?tab=readme-ov-file",
    // "#readme", "#L10-L20").
    cleaned = cleaned.split("?")[0].split("#")[0];

    // Drop trailing slash and .git suffix
    cleaned = cleaned.replace(/\/+$/, "").replace(/\.git$/i, "");

    // Matches github.com/owner/repo, www.github.com/owner/repo,
    // git@github.com:owner/repo, and the same with a /tree/branch,
    // /blob/branch/path, /issues, etc. trailing after repo.
    const urlMatch = cleaned.match(/github\.com[:/]+([^/\s]+)\/([^/\s]+)/i);
    // Matches a bare "owner/repo" shorthand with nothing else attached.
    const shorthandMatch = cleaned.match(/^([^/\s]+)\/([^/\s]+)$/);
    const match = urlMatch || shorthandMatch;

    if (!match) {
        throw new Error(
            `Could not parse a GitHub owner/repo from "${input}". Try a full URL like https://github.com/owner/repo, or just "owner/repo".`
        );
    }

    return { owner: match[1], repo: match[2] };
};

const isExcluded = (path) => EXCLUDED_DIR_SEGMENTS.some((seg) => path.includes(seg));

const isCandidateFile = (item) => {
    if (item.type !== "blob") return false;
    if (item.size && item.size > MAX_FILE_BYTES) return false;
    if (isExcluded(item.path)) return false;
    const lastDot = item.path.lastIndexOf(".");
    if (lastDot === -1) return false;
    return CODE_EXTENSIONS.has(item.path.slice(lastDot));
};

/**
 * Crawls a public GitHub repository: metadata, README, a bounded set of
 * source files (prioritizing manifest/dependency files), and recent commits.
 * Throws on invalid input, private/nonexistent repos, or rate-limit errors —
 * callers should surface the message directly, it's already descriptive.
 */
const crawlRepository = async (repoUrlOrShorthand) => {
    const { owner, repo } = parseGithubUrl(repoUrlOrShorthand);

    const { data: repoMeta } = await octokit.repos.get({ owner, repo });

    let readme = "";
    try {
        const { data } = await octokit.repos.getReadme({
            owner,
            repo,
            mediaType: { format: "raw" },
        });
        readme = typeof data === "string" ? data : "";
    } catch {
        readme = ""; // no README — not fatal
    }

    const { data: tree } = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: repoMeta.default_branch,
        recursive: "1",
    });

    const candidates = (tree.tree || []).filter(isCandidateFile);
    candidates.sort((a, b) => {
        const aName = a.path.split("/").pop();
        const bName = b.path.split("/").pop();
        const aPriority = PRIORITY_FILENAMES.has(aName) ? 0 : 1;
        const bPriority = PRIORITY_FILENAMES.has(bName) ? 0 : 1;
        return aPriority - bPriority;
    });

    const selected = candidates.slice(0, MAX_FILES);

    const files = [];
    for (const item of selected) {
        try {
            const { data: blob } = await octokit.git.getBlob({
                owner,
                repo,
                file_sha: item.sha,
            });
            const content = Buffer.from(blob.content, blob.encoding).toString("utf-8");
            files.push({ path: item.path, content });
        } catch {
            // Unreadable (binary, oversized after base64 decode, etc.) — skip it
        }
    }

    let commits = [];
    try {
        const { data } = await octokit.repos.listCommits({ owner, repo, per_page: 10 });
        commits = data.map((c) => ({
            sha: c.sha.slice(0, 7),
            message: (c.commit.message || "").split("\n")[0],
            author: c.commit.author?.name || "unknown",
            date: c.commit.author?.date || null,
        }));
    } catch {
        commits = [];
    }

    const dependencyFile = files.find((f) => PRIORITY_FILENAMES.has(f.path.split("/").pop())) || null;

    return {
        owner,
        repo,
        fullName: repoMeta.full_name,
        description: repoMeta.description || "",
        defaultBranch: repoMeta.default_branch,
        stars: repoMeta.stargazers_count,
        readme,
        files,
        commits,
        dependencyFile: dependencyFile
            ? { path: dependencyFile.path, content: dependencyFile.content.slice(0, 3000) }
            : null,
    };
};

module.exports = { crawlRepository, parseGithubUrl };
