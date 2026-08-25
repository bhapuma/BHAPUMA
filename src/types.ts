export type AssistantState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "OFFLINE"
  | "ERROR";

export interface ContactItem {
  id: string;
  name: string;
  nameNepali: string;
  phoneNumber: string;
  email?: string;
  avatarColor?: string;
  favorite?: boolean;
}

export interface InstalledApp {
  id: string;
  name: string;
  nameNepali: string;
  packageName: string;
  iconName: string;
  category: "social" | "media" | "tools" | "communication" | "system";
  webUrl?: string;
  color: string;
}

export interface UserMemory {
  userName?: string;
  nickname?: string;
  favoriteMusic?: string;
  homeCity?: string;
  notes?: string[];
  [key: string]: any;
}

export interface DeviceTelemetry {
  batteryLevel: number;
  isCharging: boolean;
  isOnline: boolean;
  volumeLevel: number; // 0 - 100
  flashlightOn: boolean;
  activeMediaTrack?: {
    title: string;
    artist: string;
    isPlaying: boolean;
  };
}

export interface PermissionStatus {
  microphone: boolean;
  contacts: boolean;
  phone: boolean;
  notifications: boolean;
  cameraTorch: boolean;
}

export interface ToolCallExecution {
  name: string;
  args: Record<string, any>;
  result?: any;
  status: "pending" | "success" | "failed" | "confirmation_required";
  nepaliSummary: string;
}

export interface GitHubStatusInfo {
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

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  displayTitle: string;
  headSha: string;
  headBranch: string;
  status: "queued" | "in_progress" | "completed" | "waiting" | string;
  conclusion: "success" | "failure" | "cancelled" | "skipped" | "timed_out" | null;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  runNumber: number;
  event: string;
  author: {
    login: string;
    avatarUrl?: string;
  };
  artifactsUrl: string;
}

export interface GitHubBuildStatusResponse {
  connected: boolean;
  repo: string | null;
  branch: string | null;
  latestRun: GitHubWorkflowRun | null;
  recentRuns: GitHubWorkflowRun[];
  releases: Array<{
    id: number;
    tagName: string;
    name: string;
    htmlUrl: string;
    publishedAt: string;
    apkDownloadUrl?: string;
    apkName?: string;
    apkSize?: number;
  }>;
}

