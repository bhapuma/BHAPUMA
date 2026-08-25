import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export interface GitHubRepoConfig {
  repoUrl: string; // e.g. https://github.com/username/repo-name or username/repo-name
  branch: string; // default 'main'
  commitMessage?: string;
  token?: string; // Optional GitHub PAT if user chooses to provide in session
}

export interface GitStatusResult {
  isGitInitialized: boolean;
  currentRemote: string | null;
  currentBranch: string | null;
  hasUncommittedChanges: boolean;
  lastCommitMessage: string | null;
  lastCommitDate: string | null;
  lastPushDate: string | null;
  lastPushStatus: "idle" | "success" | "failed";
  lastPushMessage: string | null;
  connectedRepoName: string | null;
}

// Stored in memory / local state file for persistence
const STATUS_FILE = path.join(process.cwd(), ".git_sync_status.json");

function readStoredStatus(): Partial<GitStatusResult> {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to read git sync status:", e);
  }
  return {};
}

function saveStoredStatus(status: Partial<GitStatusResult>) {
  try {
    const existing = readStoredStatus();
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ ...existing, ...status }, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to save git sync status:", e);
  }
}

/**
 * Parses user-friendly repo input (e.g. 'bhapuma/bhapuma-ai', 'https://github.com/bhapuma/bhapuma-ai.git')
 */
export function normalizeRepoUrl(input: string, token?: string): { cleanRepoName: string; authenticatedUrl: string; publicUrl: string } {
  let cleanInput = input.trim();
  
  // Remove trailing .git if present for name extraction
  let repoPath = cleanInput;
  if (repoPath.startsWith("https://github.com/")) {
    repoPath = repoPath.replace("https://github.com/", "");
  } else if (repoPath.startsWith("http://github.com/")) {
    repoPath = repoPath.replace("http://github.com/", "");
  } else if (repoPath.startsWith("git@github.com:")) {
    repoPath = repoPath.replace("git@github.com:", "");
  }
  
  if (repoPath.endsWith(".git")) {
    repoPath = repoPath.slice(0, -4);
  }
  
  // Strip any accidental leading/trailing slashes
  repoPath = repoPath.replace(/^\/+|\/+$/g, "");
  
  const publicUrl = `https://github.com/${repoPath}.git`;
  
  let authenticatedUrl = publicUrl;
  if (token && token.trim()) {
    const cleanToken = encodeURIComponent(token.trim());
    authenticatedUrl = `https://x-access-token:${cleanToken}@github.com/${repoPath}.git`;
  }
  
  return {
    cleanRepoName: repoPath,
    authenticatedUrl,
    publicUrl,
  };
}

/**
 * Get the current Git and Repository status
 */
export async function getGitStatus(): Promise<GitStatusResult> {
  const cwd = process.cwd();
  const isGit = fs.existsSync(path.join(cwd, ".git"));
  const stored = readStoredStatus();

  if (!isGit) {
    return {
      isGitInitialized: false,
      currentRemote: stored.currentRemote || null,
      currentBranch: null,
      hasUncommittedChanges: false,
      lastCommitMessage: null,
      lastCommitDate: null,
      lastPushDate: stored.lastPushDate || null,
      lastPushStatus: stored.lastPushStatus || "idle",
      lastPushMessage: stored.lastPushMessage || null,
      connectedRepoName: stored.connectedRepoName || null,
    };
  }

  let currentRemote: string | null = stored.currentRemote || null;
  let currentBranch: string | null = "main";
  let hasUncommittedChanges = false;
  let lastCommitMessage: string | null = null;
  let lastCommitDate: string | null = null;

  try {
    const remoteRes = await execAsync("git remote get-url origin", { cwd });
    currentRemote = remoteRes.stdout.trim();
  } catch {}

  try {
    const branchRes = await execAsync("git branch --show-current", { cwd });
    currentBranch = branchRes.stdout.trim() || "main";
  } catch {}

  try {
    const statusRes = await execAsync("git status --porcelain", { cwd });
    hasUncommittedChanges = statusRes.stdout.trim().length > 0;
  } catch {}

  try {
    const logRes = await execAsync('git log -1 --format="%s|||%cd"', { cwd });
    const parts = logRes.stdout.trim().split("|||");
    if (parts.length >= 2) {
      lastCommitMessage = parts[0];
      lastCommitDate = parts[1];
    }
  } catch {}

  // Strip token from remote URL before returning to client for security
  let safeRemote = currentRemote;
  let cleanRepoName = stored.connectedRepoName || null;
  if (safeRemote && safeRemote.includes("@github.com")) {
    safeRemote = safeRemote.replace(/https:\/\/[^@]+@github\.com/, "https://github.com");
  }
  if (safeRemote) {
    const match = safeRemote.match(/github\.com[/:]([^\s]+)/);
    if (match) {
      cleanRepoName = match[1].replace(/\.git$/, "");
    }
  }

  return {
    isGitInitialized: true,
    currentRemote: safeRemote,
    currentBranch,
    hasUncommittedChanges,
    lastCommitMessage,
    lastCommitDate,
    lastPushDate: stored.lastPushDate || null,
    lastPushStatus: stored.lastPushStatus || "idle",
    lastPushMessage: stored.lastPushMessage || null,
    connectedRepoName: cleanRepoName,
  };
}

/**
 * Connect/Change Repository and Push complete Android project to GitHub
 */
export async function pushProjectToGitHub(config: {
  repoUrl: string;
  branch?: string;
  commitMessage?: string;
  token?: string;
  authorName?: string;
  authorEmail?: string;
}): Promise<{ success: boolean; message: string; repoName: string; branch: string; commitSha?: string }> {
  const cwd = process.cwd();
  const branch = config.branch?.trim() || "main";
  const authorName = config.authorName?.trim() || "Bharat Pun Magar (BHAPUMA)";
  const authorEmail = config.authorEmail?.trim() || "bhapuma.official@gmail.com";
  const commitMsg = config.commitMessage?.trim() || `BHAPUMA AI Assistant Android Update [${new Date().toISOString().split("T")[0]}]`;

  const { cleanRepoName, authenticatedUrl, publicUrl } = normalizeRepoUrl(config.repoUrl, config.token);

  if (!cleanRepoName || !cleanRepoName.includes("/")) {
    throw new Error("Invalid GitHub repository format. Please provide in 'username/repository-name' format.");
  }

  // 1. Initialize Git if needed
  const isGit = fs.existsSync(path.join(cwd, ".git"));
  if (!isGit) {
    await execAsync("git init", { cwd });
    await execAsync(`git branch -M ${branch}`, { cwd });
  }

  // 2. Configure Git Author Identity locally
  await execAsync(`git config user.name "${authorName.replace(/"/g, '\\"')}"`, { cwd });
  await execAsync(`git config user.email "${authorEmail.replace(/"/g, '\\"')}"`, { cwd });

  // 3. Ensure Git Remote 'origin' points to target
  try {
    await execAsync("git remote remove origin", { cwd });
  } catch {}
  await execAsync(`git remote add origin "${authenticatedUrl}"`, { cwd });

  // 4. Ensure Web assets are built & Capacitor Android is synced prior to commit
  try {
    await execAsync("npm run build", { cwd });
    await execAsync("npx cap sync android", { cwd });
  } catch (e: any) {
    console.warn("Pre-push build/sync notice:", e?.message);
  }

  // 5. Stage all project files (ignoring .gitignore elements)
  await execAsync("git add -A", { cwd });

  // 6. Check if there are changes to commit
  let commitSha = "";
  try {
    const statusCheck = await execAsync("git status --porcelain", { cwd });
    if (statusCheck.stdout.trim().length > 0) {
      await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd });
      const shaRes = await execAsync("git rev-parse --short HEAD", { cwd });
      commitSha = shaRes.stdout.trim();
    } else {
      const shaRes = await execAsync("git rev-parse --short HEAD", { cwd });
      commitSha = shaRes.stdout.trim();
    }
  } catch (err: any) {
    // In case no commit yet
    if (!commitSha) {
      await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd });
      const shaRes = await execAsync("git rev-parse --short HEAD", { cwd });
      commitSha = shaRes.stdout.trim();
    }
  }

  // 7. Safely push to remote repository (handling existing history with safe merge or initial push)
  let pushSuccess = false;
  let pushLog = "";

  try {
    // Attempt standard push first
    const pushRes = await execAsync(`git push -u origin ${branch}`, { cwd });
    pushLog = pushRes.stdout + pushRes.stderr;
    pushSuccess = true;
  } catch (pushErr: any) {
    const errText = pushErr.message || pushErr.stderr || "";
    // If rejected due to existing remote history, fetch and merge safely
    if (errText.includes("fetch first") || errText.includes("non-fast-forward") || errText.includes("Updates were rejected")) {
      try {
        await execAsync(`git fetch origin ${branch}`, { cwd });
        await execAsync(`git merge origin/${branch} -m "Merge remote changes into BHAPUMA Android project" --allow-unrelated-histories`, { cwd });
        const retryPush = await execAsync(`git push -u origin ${branch}`, { cwd });
        pushLog = retryPush.stdout + retryPush.stderr;
        pushSuccess = true;
      } catch (mergeErr: any) {
        // As a final fallback if branch doesn't exist remotely or force push requested safely
        try {
          const forceRes = await execAsync(`git push -u origin ${branch} --force-with-lease`, { cwd });
          pushLog = forceRes.stdout + forceRes.stderr;
          pushSuccess = true;
        } catch (forceErr: any) {
          throw new Error(`GitHub Push failed: ${forceErr.message || mergeErr.message || errText}`);
        }
      }
    } else {
      throw new Error(`GitHub Push failed: ${errText}`);
    }
  }

  // Update status file
  saveStoredStatus({
    connectedRepoName: cleanRepoName,
    currentRemote: publicUrl,
    lastPushDate: new Date().toISOString(),
    lastPushStatus: "success",
    lastPushMessage: `Successfully pushed to ${cleanRepoName} (${branch}) at commit ${commitSha}`,
  });

  return {
    success: true,
    message: `Successfully pushed complete Android project to GitHub: ${cleanRepoName} on branch ${branch}!`,
    repoName: cleanRepoName,
    branch,
    commitSha,
  };
}

/**
 * Disconnect or change the GitHub repository
 */
export async function disconnectGitHub(): Promise<{ success: boolean; message: string }> {
  const cwd = process.cwd();
  try {
    await execAsync("git remote remove origin", { cwd });
  } catch {}

  saveStoredStatus({
    connectedRepoName: null,
    currentRemote: null,
    lastPushStatus: "idle",
    lastPushMessage: "Repository disconnected",
  });

  return {
    success: true,
    message: "GitHub repository disconnected successfully.",
  };
}

/**
 * Fetch the latest commit & workflow build run status directly from GitHub Actions API
 * using a secure read-only token if available.
 */
export async function getGitHubBuildStatus(repoOwnerAndName?: string, customToken?: string) {
  const status = await getGitStatus();
  const repoName = repoOwnerAndName?.trim() || status.connectedRepoName;

  if (!repoName || !repoName.includes("/")) {
    return {
      connected: false,
      repo: null,
      branch: status.currentBranch || "main",
      latestRun: null,
      recentRuns: [],
      releases: [],
    };
  }

  // Token prioritization:
  // 1. Provided customToken (from UI session or request)
  // 2. process.env.GITHUB_READ_TOKEN or process.env.GITHUB_TOKEN
  const token = customToken?.trim() || process.env.GITHUB_READ_TOKEN || process.env.GITHUB_TOKEN || "";

  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "BHAPUMA-Android-Applet",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const [owner, repo] = repoName.split("/");

  let recentRuns: any[] = [];
  let latestRun: any = null;
  let releases: any[] = [];

  // 1. Fetch Workflow Runs from GitHub Actions API
  try {
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`;
    const runsRes = await fetch(runsUrl, { headers });

    if (runsRes.ok) {
      const data: any = await runsRes.json();
      if (data.workflow_runs && Array.isArray(data.workflow_runs)) {
        recentRuns = data.workflow_runs.map((r: any) => ({
          id: r.id,
          name: r.name,
          displayTitle: r.display_title || r.head_commit?.message || "Workflow Run",
          headSha: r.head_sha ? r.head_sha.substring(0, 7) : "",
          headBranch: r.head_branch || "main",
          status: r.status, // queued, in_progress, completed
          conclusion: r.conclusion, // success, failure, cancelled, etc.
          htmlUrl: r.html_url,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          runNumber: r.run_number,
          event: r.event,
          author: {
            login: r.triggering_actor?.login || r.head_commit?.author?.name || "Author",
            avatarUrl: r.triggering_actor?.avatar_url,
          },
          artifactsUrl: r.artifacts_url,
        }));

        if (recentRuns.length > 0) {
          latestRun = recentRuns[0];
        }
      }
    } else {
      const errText = await runsRes.text();
      console.warn(`GitHub Actions API returned ${runsRes.status}:`, errText);
    }
  } catch (err: any) {
    console.warn("Failed to fetch GitHub Actions runs:", err.message);
  }

  // 2. Fetch Latest Releases & APKs
  try {
    const relUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=3`;
    const relRes = await fetch(relUrl, { headers });

    if (relRes.ok) {
      const relData: any = await relRes.json();
      if (Array.isArray(relData)) {
        releases = relData.map((rel: any) => {
          // Find apk asset if exists
          const apkAsset = rel.assets?.find((a: any) => a.name.endsWith(".apk") || a.content_type?.includes("android.package-archive"));
          return {
            id: rel.id,
            tagName: rel.tag_name,
            name: rel.name || rel.tag_name,
            htmlUrl: rel.html_url,
            publishedAt: rel.published_at || rel.created_at,
            apkDownloadUrl: apkAsset ? apkAsset.browser_download_url : undefined,
            apkName: apkAsset ? apkAsset.name : undefined,
            apkSize: apkAsset ? apkAsset.size : undefined,
          };
        });
      }
    }
  } catch (err: any) {
    console.warn("Failed to fetch GitHub releases:", err.message);
  }

  return {
    connected: true,
    repo: repoName,
    branch: status.currentBranch || "main",
    latestRun,
    recentRuns,
    releases,
  };
}
