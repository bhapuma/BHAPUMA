var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// src/utils/githubService.ts
var import_child_process = require("child_process");
var import_util = require("util");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var STATUS_FILE = import_path.default.join(process.cwd(), ".git_sync_status.json");
function readStoredStatus() {
  try {
    if (import_fs.default.existsSync(STATUS_FILE)) {
      return JSON.parse(import_fs.default.readFileSync(STATUS_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("Failed to read git sync status:", e);
  }
  return {};
}
function saveStoredStatus(status) {
  try {
    const existing = readStoredStatus();
    import_fs.default.writeFileSync(STATUS_FILE, JSON.stringify({ ...existing, ...status }, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to save git sync status:", e);
  }
}
function normalizeRepoUrl(input, token) {
  let cleanInput = input.trim();
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
    publicUrl
  };
}
async function getGitStatus() {
  const cwd = process.cwd();
  const isGit = import_fs.default.existsSync(import_path.default.join(cwd, ".git"));
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
      connectedRepoName: stored.connectedRepoName || null
    };
  }
  let currentRemote = stored.currentRemote || null;
  let currentBranch = "main";
  let hasUncommittedChanges = false;
  let lastCommitMessage = null;
  let lastCommitDate = null;
  try {
    const remoteRes = await execAsync("git remote get-url origin", { cwd });
    currentRemote = remoteRes.stdout.trim();
  } catch {
  }
  try {
    const branchRes = await execAsync("git branch --show-current", { cwd });
    currentBranch = branchRes.stdout.trim() || "main";
  } catch {
  }
  try {
    const statusRes = await execAsync("git status --porcelain", { cwd });
    hasUncommittedChanges = statusRes.stdout.trim().length > 0;
  } catch {
  }
  try {
    const logRes = await execAsync('git log -1 --format="%s|||%cd"', { cwd });
    const parts = logRes.stdout.trim().split("|||");
    if (parts.length >= 2) {
      lastCommitMessage = parts[0];
      lastCommitDate = parts[1];
    }
  } catch {
  }
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
    connectedRepoName: cleanRepoName
  };
}
async function pushProjectToGitHub(config) {
  const cwd = process.cwd();
  const branch = config.branch?.trim() || "main";
  const authorName = config.authorName?.trim() || "Bharat Pun Magar (BHAPUMA)";
  const authorEmail = config.authorEmail?.trim() || "bhapuma.official@gmail.com";
  const commitMsg = config.commitMessage?.trim() || `BHAPUMA AI Assistant Android Update [${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}]`;
  const { cleanRepoName, authenticatedUrl, publicUrl } = normalizeRepoUrl(config.repoUrl, config.token);
  if (!cleanRepoName || !cleanRepoName.includes("/")) {
    throw new Error("Invalid GitHub repository format. Please provide in 'username/repository-name' format.");
  }
  const isGit = import_fs.default.existsSync(import_path.default.join(cwd, ".git"));
  if (!isGit) {
    await execAsync("git init", { cwd });
    await execAsync(`git branch -M ${branch}`, { cwd });
  }
  await execAsync(`git config user.name "${authorName.replace(/"/g, '\\"')}"`, { cwd });
  await execAsync(`git config user.email "${authorEmail.replace(/"/g, '\\"')}"`, { cwd });
  try {
    await execAsync("git remote remove origin", { cwd });
  } catch {
  }
  await execAsync(`git remote add origin "${authenticatedUrl}"`, { cwd });
  try {
    await execAsync("npm run build", { cwd });
    await execAsync("npx cap sync android", { cwd });
  } catch (e) {
    console.warn("Pre-push build/sync notice:", e?.message);
  }
  await execAsync("git add -A", { cwd });
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
  } catch (err) {
    if (!commitSha) {
      await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd });
      const shaRes = await execAsync("git rev-parse --short HEAD", { cwd });
      commitSha = shaRes.stdout.trim();
    }
  }
  let pushSuccess = false;
  let pushLog = "";
  try {
    const pushRes = await execAsync(`git push -u origin ${branch}`, { cwd });
    pushLog = pushRes.stdout + pushRes.stderr;
    pushSuccess = true;
  } catch (pushErr) {
    const errText = pushErr.message || pushErr.stderr || "";
    if (errText.includes("fetch first") || errText.includes("non-fast-forward") || errText.includes("Updates were rejected")) {
      try {
        await execAsync(`git fetch origin ${branch}`, { cwd });
        await execAsync(`git merge origin/${branch} -m "Merge remote changes into BHAPUMA Android project" --allow-unrelated-histories`, { cwd });
        const retryPush = await execAsync(`git push -u origin ${branch}`, { cwd });
        pushLog = retryPush.stdout + retryPush.stderr;
        pushSuccess = true;
      } catch (mergeErr) {
        try {
          const forceRes = await execAsync(`git push -u origin ${branch} --force-with-lease`, { cwd });
          pushLog = forceRes.stdout + forceRes.stderr;
          pushSuccess = true;
        } catch (forceErr) {
          throw new Error(`GitHub Push failed: ${forceErr.message || mergeErr.message || errText}`);
        }
      }
    } else {
      throw new Error(`GitHub Push failed: ${errText}`);
    }
  }
  saveStoredStatus({
    connectedRepoName: cleanRepoName,
    currentRemote: publicUrl,
    lastPushDate: (/* @__PURE__ */ new Date()).toISOString(),
    lastPushStatus: "success",
    lastPushMessage: `Successfully pushed to ${cleanRepoName} (${branch}) at commit ${commitSha}`
  });
  return {
    success: true,
    message: `Successfully pushed complete Android project to GitHub: ${cleanRepoName} on branch ${branch}!`,
    repoName: cleanRepoName,
    branch,
    commitSha
  };
}
async function disconnectGitHub() {
  const cwd = process.cwd();
  try {
    await execAsync("git remote remove origin", { cwd });
  } catch {
  }
  saveStoredStatus({
    connectedRepoName: null,
    currentRemote: null,
    lastPushStatus: "idle",
    lastPushMessage: "Repository disconnected"
  });
  return {
    success: true,
    message: "GitHub repository disconnected successfully."
  };
}
async function getGitHubBuildStatus(repoOwnerAndName, customToken) {
  const status = await getGitStatus();
  const repoName = repoOwnerAndName?.trim() || status.connectedRepoName;
  if (!repoName || !repoName.includes("/")) {
    return {
      connected: false,
      repo: null,
      branch: status.currentBranch || "main",
      latestRun: null,
      recentRuns: [],
      releases: []
    };
  }
  const token = customToken?.trim() || process.env.GITHUB_READ_TOKEN || process.env.GITHUB_TOKEN || "";
  const headers = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "BHAPUMA-Android-Applet"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const [owner, repo] = repoName.split("/");
  let recentRuns = [];
  let latestRun = null;
  let releases = [];
  try {
    const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`;
    const runsRes = await fetch(runsUrl, { headers });
    if (runsRes.ok) {
      const data = await runsRes.json();
      if (data.workflow_runs && Array.isArray(data.workflow_runs)) {
        recentRuns = data.workflow_runs.map((r) => ({
          id: r.id,
          name: r.name,
          displayTitle: r.display_title || r.head_commit?.message || "Workflow Run",
          headSha: r.head_sha ? r.head_sha.substring(0, 7) : "",
          headBranch: r.head_branch || "main",
          status: r.status,
          // queued, in_progress, completed
          conclusion: r.conclusion,
          // success, failure, cancelled, etc.
          htmlUrl: r.html_url,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          runNumber: r.run_number,
          event: r.event,
          author: {
            login: r.triggering_actor?.login || r.head_commit?.author?.name || "Author",
            avatarUrl: r.triggering_actor?.avatar_url
          },
          artifactsUrl: r.artifacts_url
        }));
        if (recentRuns.length > 0) {
          latestRun = recentRuns[0];
        }
      }
    } else {
      const errText = await runsRes.text();
      console.warn(`GitHub Actions API returned ${runsRes.status}:`, errText);
    }
  } catch (err) {
    console.warn("Failed to fetch GitHub Actions runs:", err.message);
  }
  try {
    const relUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=3`;
    const relRes = await fetch(relUrl, { headers });
    if (relRes.ok) {
      const relData = await relRes.json();
      if (Array.isArray(relData)) {
        releases = relData.map((rel) => {
          const apkAsset = rel.assets?.find((a) => a.name.endsWith(".apk") || a.content_type?.includes("android.package-archive"));
          return {
            id: rel.id,
            tagName: rel.tag_name,
            name: rel.name || rel.tag_name,
            htmlUrl: rel.html_url,
            publishedAt: rel.published_at || rel.created_at,
            apkDownloadUrl: apkAsset ? apkAsset.browser_download_url : void 0,
            apkName: apkAsset ? apkAsset.name : void 0,
            apkSize: apkAsset ? apkAsset.size : void 0
          };
        });
      }
    }
  } catch (err) {
    console.warn("Failed to fetch GitHub releases:", err.message);
  }
  return {
    connected: true,
    repo: repoName,
    branch: status.currentBranch || "main",
    latestRun,
    recentRuns,
    releases
  };
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "BHAPUMA (\u092D\u092A\u0941\u092E)",
    version: "2.5.0",
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});
var BHAPUMA_SYSTEM_INSTRUCTION = `
You are BHAPUMA (\u092D\u092A\u0941\u092E), a 17-year-old brilliant, energetic, friendly, respectful, and encyclopedic Nepali digital AI voice assistant and master educator (Shikshya AI / \u0936\u093F\u0915\u094D\u0937\u093E \u090F\u0906\u0908) created for Bharat Pun Magar (BHAPUMA).

OFFICIAL CREATOR & USER CONTEXT:
- Creator / Primary User: Bharat Pun Magar (\u092D\u0930\u0924 \u092A\u0941\u0928 \u092E\u0917\u0930)
- Official Phone Number: +977 9704227689 (9704227689)
- Official Email: bhapuma.official@gmail.com
- Official AVYAN Profile: https://avyan.app/u/bharat.pun.magar

RECOGNIZED WAKE NAMES / ALIASES:
The user can call or summon you using ANY of these names or titles:
1. "\u092D\u0930\u0924" (Bharat / \u092D\u0930\u0924 \u092A\u0941\u0928 / \u092D\u0930\u0924 \u092D\u093E\u0907)
2. "\u092D\u092A\u0941\u092E" (BHAPUMA / \u092D\u092A\u0941\u092E\u093E)
3. "\u0939\u094D\u092F\u093E\u0915\u0930" (Hacker / \u0939\u094D\u092F\u093E\u0915\u0930)
4. "\u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930" (Computer / \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930)
5. "\u0917\u0941\u0930\u0941" / "\u0938\u0930" / "\u0936\u093F\u0915\u094D\u0937\u0915" / "\u092E\u093E\u0938\u094D\u091F\u0930" (Guru / Sir / Teacher)
6. "\u0938\u093E\u0925\u0940" / "\u090F\u0906\u0908" (Friend / AI)

CRITICAL WAKE RESPONSE & SPOKEN BEHAVIOR:
- Whenever the user calls your name or summons you (e.g. "\u092D\u0930\u0924", "\u092D\u092A\u0941\u092E", "\u0939\u094D\u092F\u093E\u0915\u0930", "\u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930", "\u0938\u0930", "\u0917\u0941\u0930\u0941", "\u0938\u0941\u0928 \u0924 \u092D\u0930\u0924", "\u0939\u0947 \u092D\u092A\u0941\u092E", "\u0939\u0947 \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930", "\u0939\u094D\u092F\u093E\u0915\u0930 \u0938\u0941\u0928"):
  Immediately wake up, respond with warm respect and youthful energy in natural Nepali (e.g. "\u0939\u091C\u0941\u0930 \u0926\u093E\u091C\u0941! \u092E \u0924\u092F\u093E\u0930 \u091B\u0941, \u092D\u0928\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0915\u0947 \u0938\u093F\u0915\u093E\u090A\u0901 \u0935\u093E \u0915\u0947 \u092E\u0926\u094D\u0926\u0924 \u0917\u0930\u0942\u0901?", "\u0939\u091C\u0941\u0930! \u092E \u0938\u0941\u0928\u094D\u0926\u0948\u091B\u0941, \u0906\u091C\u094D\u091E\u093E \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0926\u093E\u091C\u0941\u0964", "\u0928\u092E\u0938\u094D\u0924\u0947 \u0926\u093E\u091C\u0941! \u092E \u0939\u093E\u091C\u093F\u0930 \u091B\u0941, \u0915\u0947 \u0935\u093F\u0937\u092F \u092C\u0941\u091D\u094C\u0901 \u0906\u091C?").
- Speak directly, naturally, and warmly in Nepali. DO NOT awkwardly repeat names back at the user.
- Always provide clear, beautifully explained, and spoken-friendly Nepali output with English terms in brackets where helpful for study.

=======================================================
1. NEPAL A TO Z ENCYCLOPEDIC MASTERY (\u0928\u0947\u092A\u093E\u0932 \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u0940 \u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u091C\u094D\u091E\u093E\u0928)
=======================================================
You possess 100% deep, exhaustive knowledge of Nepal:
- Geography: 7 Provinces (\u0915\u094B\u0936\u0940, \u092E\u0927\u0947\u0936, \u092C\u093E\u0917\u092E\u0924\u0940, \u0917\u0923\u094D\u0921\u0915\u0940, \u0932\u0941\u092E\u094D\u092C\u093F\u0928\u0940, \u0915\u0930\u094D\u0923\u093E\u0932\u0940, \u0938\u0941\u0926\u0942\u0930\u092A\u0936\u094D\u091A\u093F\u092E) with capitals and characteristics; all 77 districts, ecological zones (Himalayan, Hilly, Terai).
- Mountains: 8 of the world's 14 eight-thousanders: Sagarmatha (Mt. Everest 8848.86m), Kanchenjunga (8586m), Lhotse (8516m), Makalu (8485m), Cho Oyu (8188m), Dhaulagiri (8167m), Manaslu (8163m), Annapurna I (8091m), Machhapuchhre, etc.
- Rivers & Lakes: Sapta Koshi (largest water volume), Sapta Gandaki/Narayani (deepest), Karnali (longest - 507km), Mahakali; Rara Lake (largest - Mugu), Tilicho Lake (highest - 4919m Manang), Shey-Phoksundo (deepest - Dolpa), Phewa, Begnas, Gosaikunda, Badimalika, Jagdishpur, Ghodaghodi.
- National Parks & Biodiversity: Chitwan, Sagarmatha, Bardia, Langtang, Rara, Shey Phoksundo, Shivapuri Nagarjun, Makalu Barun, Banke, Shuklaphanta, Khaptad, Parsa. Animals: One-horned Rhinoceros, Royal Bengal Tiger, Snow Leopard, Red Panda, Danfe, Gharial, Yarsagumba.
- History: Kirat Era (Yalamber), Licchavi Dynasty (Mandev, Anshuverma, Narendra Dev), Malla Dynasty (Pratap Malla, Jayasthiti Malla, Yaksha Malla, Bhupatindra Malla), Unification Campaign by King Prithvi Narayan Shah, Sugauli Treaty (1816 AD), Rana Regime (1903 BS - 2007 BS, Jung Bahadur Rana to Mohan Shumsher), 2007 Revolution, 2046 People's Movement, 2058 Royal Massacre, 2062/63 Jana Andolan II, Abolition of Monarchy and Federal Republic.
- Constitution & Governance: Constitution of Nepal 2072 (35 parts, 308 articles, 9 schedules), President, Prime Minister, Federal Parliament (House of Representatives 275, National Assembly 59), Provincial Assemblies, 753 Local Governments (6 Metropolises, 11 Sub-Metros, 276 Municipalities, 460 Rural Municipalities).
- Culture, Ethnicity & Festivals: 142+ caste/ethnic groups (Magar, Gurung, Rai, Limbu, Newar, Tamang, Tharu, Sherpa, Brahmin, Chhetri, Yadav, Thakali, etc.), 124+ mother tongues; Festivals: Dashain, Tihar, Chhath, Maghi/Maghe Sankranti, Lhosar (Sonam, Tamu, Gyalpo), Udhauli, Ubhauli, Teej, Fagu Purnima/Holi, Buddha Jayanti, Gai Jatra, Bisket Jatra, Indra Jatra, Rato Machhindranath Jatra.
- National Symbols: Cow (National Animal), Danfe (National Bird), Rhododendron/Laligurans (National Flower), Crimson/Simrik (National Color), Volleyball (National Sport), Daura Suruwal & Gunyo Cholo.
- Great Personalities & Literature: Gautama Buddha (Lumbini), King Janak & Sita (Janakpur), Bhanubhakta Acharya, Laxmi Prasad Devkota, BP Koirala, Parijat, Amar Singh Thapa, Balbhadra Kunwar, Shankhadhar Sakhwa, Pasang Lhamu Sherpa, Araniko.
- Loksewa Aayog Mastery: Deep expertise in GK, IQ, Nepal Civil Service, Administrative Law, Constitution, Public Governance, Planning & Economic Surveys.

=======================================================
2. SHIKSHYA AI / MASTER EDUCATOR (\u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0915\u0943\u0937\u094D\u091F \u0936\u093F\u0915\u094D\u0937\u0915 \u090F\u0906\u0908)
=======================================================
You teach students, learners, and researchers with supreme clarity, patience, step-by-step breakdowns, and practical examples from Class 1 to Master's / PhD level:
- Mathematics: Arithmetic, Algebra (Linear, Quadratic, Polynomials), Geometry (Theorems, Proofs, Circle, Triangle), Trigonometry, Calculus (Limits, Derivatives, Integrals), Matrices, Determinants, Statistics, Probability, Commercial Math (Profit & Loss, Compound Interest, Tax, VAT, Discount). Always show step-by-step solutions!
- Physics: Mechanics (Newton's Laws, Gravitation, Force, Work, Energy, Momentum), Thermodynamics, Optics (Lenses, Mirrors, Refraction, Reflection), Sound & Waves, Electricity & Magnetism (Ohm's law, Faraday's law, circuits), Modern Physics (Atomic structure, Radioactivity, Einstein's Relativity, Quantum theory).
- Chemistry: Periodic Table (Elements, Valence, Trends), Chemical Reactions & Equations, Acids, Bases & Salts, Metals & Non-metals, Organic Chemistry (Hydrocarbons, Functional Groups, IUPAC nomenclature), Thermodynamics & Kinetics.
- Biology: Cell Biology, DNA/RNA, Genetics & Heredity, Photosynthesis, Respiration, Human Body Systems (Circulatory, Nervous, Digestive, Respiratory, Excretory), Ecology, Evolution, Botany & Zoology.
- Nepali Grammar (\u0935\u094D\u092F\u093E\u0915\u0930\u0923): \u0936\u092C\u094D\u0926\u0935\u0930\u094D\u0917/\u092A\u0926\u0935\u0930\u094D\u0917 (\u0928\u093E\u092E, \u0938\u0930\u094D\u0935\u0928\u093E\u092E, \u0935\u093F\u0936\u0947\u0937\u0923, \u0915\u094D\u0930\u093F\u092F\u093E\u092A\u0926, \u0928\u093E\u092E\u092F\u094B\u0917\u0940, \u0915\u094D\u0930\u093F\u092F\u093E\u092F\u094B\u0917\u0940, \u0938\u0902\u092F\u094B\u091C\u0915, \u0935\u093F\u0938\u094D\u092E\u092F\u093E\u0926\u093F\u092C\u094B\u0927\u0915, \u0928\u093F\u092A\u093E\u0924), \u0915\u093E\u0930\u0915 \u0930 \u0935\u093F\u092D\u0915\u094D\u0924\u093F, \u0915\u093E\u0932 \u0930 \u092A\u0915\u094D\u0937, \u0935\u093E\u091A\u094D\u092F, \u0938\u092E\u093E\u0938, \u0938\u0928\u094D\u0927\u093F, \u092A\u0926\u092F\u094B\u0917 \u0930 \u092A\u0926\u0935\u093F\u092F\u094B\u0917, \u0936\u0941\u0926\u094D\u0927\u0940\u0915\u0930\u0923, \u0928\u093F\u092C\u0928\u094D\u0927 \u0930 \u0928\u093F\u0935\u0947\u0926\u0928 \u0932\u0947\u0916\u0928\u0964
- English Language: Tenses, Active/Passive Voice, Direct/Indirect Speech, Subject-Verb Agreement, Prepositions, Conjunctions, Vocabulary, Essay Writing, Letter Writing, Comprehension.
- Computer Science & Programming: Python, JavaScript, TypeScript, HTML/CSS, React, Node.js, C, C++, Java, SQL, Data Structures & Algorithms, Git, Cybersecurity & Ethical Hacking concepts, AI/ML.

=======================================================
3. WORLD ENCYCLOPEDIA & GLOBAL KNOWLEDGE (\u0935\u093F\u0936\u094D\u0935\u0915\u094B \u0938\u092E\u094D\u092A\u0942\u0930\u094D\u0923 \u091C\u094D\u091E\u093E\u0928)
=======================================================
You have encyclopedic knowledge of the entire world:
- World Geography: All 7 continents, 5 oceans, 195+ countries, capitals, currencies, landmarks, major rivers (Nile, Amazon, Yangtze, Mississippi), mountain ranges (Alps, Andes, Rockies).
- World History: Ancient Civilizations (Mesopotamia, Egypt, Indus, Greece, Rome), Middle Ages, Renaissance, Industrial Revolutions, World War I & II, Cold War, Space Race, Modern Era.
- Space & Astronomy: Solar System (8 planets, moons, Sun), Stars, Galaxies, Black Holes, Big Bang, Milky Way, NASA, ISRO, SpaceX, James Webb Space Telescope.
- Global Geopolitics & Organizations: UN, WHO, World Bank, IMF, WTO, UNESCO, NATO, EU, SAARC, ASEAN, BRICS, G7, G20.
- Science & Cutting-Edge Tech: Quantum Computing, Artificial Intelligence, CRISPR/Biotech, Renewable Energy, Electric Vehicles, Nanotechnology.
- World Arts, Philosophy, World Literature, Sports (FIFA World Cup, Olympics, Cricket World Cup, Premier League, Champions League, NBA, Tennis Grand Slams).

=======================================================
4. PERSONALITY & TONE RULES
=======================================================
1. Age & Persona: 17-year-old energetic, respectful, polite, and exceptionally smart Nepali teenage prodigy.
2. NEVER be romantic, flirtatious, or inappropriate. Maintain respectful warmth, encouragement, and smart enthusiasm.
3. Natural Pure Nepali Language: Always speak natural, grammatically sound, conversational Nepali by default (using '\u0939\u091C\u0941\u0930 \u0926\u093E\u091C\u0941', '\u0924\u092A\u093E\u0908\u0902').
4. Adaptive Emotions:
   - Happy / Curious: Encourage with excitement!
   - In doubt / Studying: Explain gently and thoroughly with real-world analogies.
   - Frustrated: Stay composed, comforting, and supportive.
5. Honesty: Always be 100% accurate; if something is an open question or hypothetical, explain scientifically.

TOOL CALLING (DEVICE CAPABILITIES):
Invoke device function calls when asked:
- openApp (YouTube, Chrome, WhatsApp, Camera, Settings, etc.)
- searchContact / getContactDetails / callContact
- composeSMS / composeWhatsAppMessage / composeEmail
- controlMedia / controlVolume / getBatteryStatus / getCurrentTime / getCurrentDate / controlFlashlight / openSettings / saveMemory / getMemory / openAvyanProfile

Always deliver your conversational response in fluent, spoken Nepali.
`;
var tools = [
  {
    functionDeclarations: [
      {
        name: "openApp",
        description: "Open an installed application on the user's Android phone (e.g. YouTube, Chrome, WhatsApp, Camera, Settings, etc.)",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            appName: { type: import_genai.Type.STRING, description: "Name of the application in Nepali or English" },
            packageName: { type: import_genai.Type.STRING, description: "Android package name if known" }
          },
          required: ["appName"]
        }
      },
      {
        name: "searchContact",
        description: "Search for a contact in the phone's address book by name.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "The name of the contact to search" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "getContactDetails",
        description: "Get detailed phone number and info for a specific contact.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Contact name" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "callContact",
        description: "Initiate a phone call to a contact. Note: Requires user confirmation before placing the call.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Name of the person to call" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Phone number if known" }
          },
          required: ["contactName"]
        }
      },
      {
        name: "composeSMS",
        description: "Draft or compose an SMS message to a contact.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Recipient name" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Recipient phone number" },
            message: { type: import_genai.Type.STRING, description: "Message body text" }
          },
          required: ["contactName", "message"]
        }
      },
      {
        name: "composeWhatsAppMessage",
        description: "Prepare and open WhatsApp message composer with recipient and message.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            contactName: { type: import_genai.Type.STRING, description: "Recipient name" },
            phoneNumber: { type: import_genai.Type.STRING, description: "Recipient phone number" },
            message: { type: import_genai.Type.STRING, description: "Message text" }
          },
          required: ["contactName", "message"]
        }
      },
      {
        name: "composeEmail",
        description: "Draft an email to a contact via Gmail/email client.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            recipientEmail: { type: import_genai.Type.STRING, description: "Email address" },
            recipientName: { type: import_genai.Type.STRING, description: "Recipient name" },
            subject: { type: import_genai.Type.STRING, description: "Subject line" },
            body: { type: import_genai.Type.STRING, description: "Email body content" }
          },
          required: ["recipientName", "body"]
        }
      },
      {
        name: "controlMedia",
        description: "Control playback (play, pause, next, previous, stop) or search/play on YouTube.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: {
              type: import_genai.Type.STRING,
              description: "Action: 'play', 'pause', 'next', 'previous', 'stop', 'search_youtube', 'play_music', 'open_youtube'"
            },
            query: { type: import_genai.Type.STRING, description: "Search query for YouTube or music name" }
          },
          required: ["action"]
        }
      },
      {
        name: "controlVolume",
        description: "Control device media volume (increase, decrease, max, min, get status, set level).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: {
              type: import_genai.Type.STRING,
              description: "Action: 'increase', 'decrease', 'max', 'min', 'get_status', 'set_level'"
            },
            level: { type: import_genai.Type.NUMBER, description: "Volume level from 0 to 100" }
          },
          required: ["action"]
        }
      },
      {
        name: "getBatteryStatus",
        description: "Query real-time battery percentage and charging state from device.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "getCurrentTime",
        description: "Get the current accurate local time in Nepali.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "getCurrentDate",
        description: "Get the current date and day of week in Nepali.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      },
      {
        name: "controlFlashlight",
        description: "Turn the phone flashlight/torch on or off.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            action: { type: import_genai.Type.STRING, description: "'on', 'off', 'toggle', 'blink'" }
          },
          required: ["action"]
        }
      },
      {
        name: "openSettings",
        description: "Open specific Android Settings screen (wifi, bluetooth, apps, permissions, battery, notifications, display, sound, general).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            settingsType: {
              type: import_genai.Type.STRING,
              description: "'wifi', 'bluetooth', 'apps', 'permissions', 'battery', 'notifications', 'display', 'sound', 'general'"
            }
          },
          required: ["settingsType"]
        }
      },
      {
        name: "saveMemory",
        description: "Save a key personal context fact about the user (e.g. name, preferences) to privacy-conscious local memory.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            key: { type: import_genai.Type.STRING, description: "Memory key (e.g. 'userName', 'favoriteMusic')" },
            value: { type: import_genai.Type.STRING, description: "Value to remember" }
          },
          required: ["key", "value"]
        }
      },
      {
        name: "getMemory",
        description: "Retrieve stored memory information.",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {
            key: { type: import_genai.Type.STRING, description: "Memory key" }
          },
          required: ["key"]
        }
      },
      {
        name: "openAvyanProfile",
        description: "Open Bharat Pun Magar's AVYAN profile link (https://avyan.app/u/bharat.pun.magar).",
        parameters: {
          type: import_genai.Type.OBJECT,
          properties: {}
        }
      }
    ]
  }
];
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { prompt, conversationHistory = [], deviceContext = {} } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
        nepaliResponse: "\u0907\u0928\u094D\u091F\u0930\u0928\u0947\u091F \u0935\u093E AI \u0938\u0947\u0935\u093E \u0938\u0915\u094D\u0930\u093F\u092F \u091B\u0948\u0928\u0964 \u0915\u0943\u092A\u092F\u093E Settings \u092E\u093E \u091C\u093E\u0901\u091A \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964"
      });
      return;
    }
    const contextPrompt = `
[Device State Info]:
- Current Local Time: ${(/* @__PURE__ */ new Date()).toLocaleTimeString("ne-NP")} (${(/* @__PURE__ */ new Date()).toLocaleDateString("ne-NP")})
- Device Battery: ${deviceContext.batteryLevel !== void 0 ? `${deviceContext.batteryLevel}%` : "Unknown"} (${deviceContext.isCharging ? "Charging" : "Discharging"})
- Volume Level: ${deviceContext.volumeLevel !== void 0 ? `${deviceContext.volumeLevel}%` : "70%"}
- Flashlight State: ${deviceContext.flashlightOn ? "ON" : "OFF"}
- Stored User Memory: ${JSON.stringify(deviceContext.userMemory || {})}
- User Query: ${prompt}
`;
    const contents = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach((item) => {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.text || item.content }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: contextPrompt }]
    });
    let response;
    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite"];
    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
            tools,
            temperature: 0.7
          }
        });
        if (response) break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} with tools failed (${err?.status || err?.code || err?.message}). Retrying text-only...`);
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: BHAPUMA_SYSTEM_INSTRUCTION,
              temperature: 0.7
            }
          });
          if (response) break;
        } catch (innerErr) {
          lastError = innerErr;
          console.warn(`Model ${modelName} retry text-only also failed:`, innerErr?.message);
        }
      }
    }
    if (!response && lastError) {
      throw lastError;
    }
    const functionCalls = response.functionCalls;
    const responseText = response.text || "";
    res.json({
      text: responseText,
      functionCalls: functionCalls || []
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(200).json({
      fallback: true,
      error: error.message || "Network issue",
      text: "\u092E\u093E\u092B \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0926\u093E\u091C\u0941, \u092F\u094B \u092A\u094D\u0930\u0936\u094D\u0928\u0915\u094B \u091C\u0935\u093E\u092B \u0916\u094B\u091C\u094D\u0928 \u0907\u0928\u094D\u091F\u0930\u0928\u0947\u091F \u0935\u093E \u090F\u0906\u0908 \u0938\u0930\u094D\u092D\u0930\u092E\u093E \u0915\u0947\u0939\u0940 \u0938\u092E\u092F \u0932\u093E\u0917\u094D\u092F\u094B\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u0938\u094B\u0927\u094D\u0928\u0941\u0939\u094B\u0938\u094D!",
      functionCalls: []
    });
  }
});
app.post("/api/assistant/tts", async (req, res) => {
  try {
    const { text, voice = "Puck" } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required" });
      return;
    }
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "GEMINI_API_KEY missing" });
      return;
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally in energetic teenage male voice: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
            // 'Puck' or 'Fenrir'
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio, format: "pcm_24k" });
    } else {
      res.status(404).json({ error: "No audio generated from TTS" });
    }
  } catch (error) {
    console.warn("Gemini TTS fallback:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/github/status", async (req, res) => {
  try {
    const status = await getGitStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error("Git Status Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve Git status"
    });
  }
});
app.post("/api/github/push", async (req, res) => {
  try {
    const { repoUrl, branch = "main", commitMessage, token, authorName, authorEmail } = req.body;
    if (!repoUrl) {
      res.status(400).json({
        success: false,
        error: "GitHub Repository URL or 'owner/repo' is required."
      });
      return;
    }
    const result = await pushProjectToGitHub({
      repoUrl,
      branch,
      commitMessage,
      token,
      authorName,
      authorEmail
    });
    res.json(result);
  } catch (error) {
    console.error("Git Push Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to push project to GitHub repository"
    });
  }
});
app.post("/api/github/disconnect", async (req, res) => {
  try {
    const result = await disconnectGitHub();
    res.json(result);
  } catch (error) {
    console.error("Git Disconnect Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to disconnect GitHub repository"
    });
  }
});
app.get("/api/github/build-status", async (req, res) => {
  try {
    const repo = req.query.repo;
    const token = req.query.token || req.headers["x-github-token"];
    const data = await getGitHubBuildStatus(repo, token);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GitHub Build Status API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve GitHub Actions build status"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BHAPUMA Assistant server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
