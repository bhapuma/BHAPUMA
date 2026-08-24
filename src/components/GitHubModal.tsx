import React, { useState, useEffect } from 'react';
import {
  X,
  Github,
  GitBranch,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Unlink,
  ExternalLink,
  ShieldCheck,
  Code2,
  Terminal,
  FileCheck,
  Lock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { GitHubStatusInfo } from '../types';

interface GitHubModalProps {
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ onClose }) => {
  const [gitStatus, setGitStatus] = useState<GitHubStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form inputs
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');
  const [commitMessage, setCommitMessage] = useState(
    `BHAPUMA AI Assistant Android Update [${new Date().toISOString().split('T')[0]}]`
  );
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Fetch current Git Status from backend
  const fetchStatus = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch('/api/github/status');
      const data = await res.json();
      if (data.success && data.status) {
        setGitStatus(data.status);
        if (data.status.connectedRepoName && !repoInput) {
          setRepoInput(data.status.connectedRepoName);
        }
        if (data.status.currentBranch) {
          setBranchInput(data.status.currentBranch);
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch git status:', err);
      setErrorMsg('Git स्थिति लोड गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Handle Commit & Push to GitHub
  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim()) {
      setErrorMsg('कृपया GitHub Repository नाम वा URL राख्नुहोस् (उदा: bhapuma/bhapuma-ai)।');
      return;
    }

    try {
      setPushing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoInput.trim(),
          branch: branchInput.trim() || 'main',
          commitMessage: commitMessage.trim(),
          token: tokenInput.trim() || undefined,
          authorName: 'Bharat Pun Magar (BHAPUMA)',
          authorEmail: 'bhapuma.official@gmail.com',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'GitHub Push अयशस्वी भयो।');
      }

      setSuccessMsg(data.message || 'Android Project सफलतापूर्वक GitHub मा Push भयो!');
      // Clear sensitive token from field
      setTokenInput('');
      await fetchStatus();
    } catch (err: any) {
      console.error('Push error:', err);
      setErrorMsg(err.message || 'GitHub Push गर्दा त्रुटि आयो।');
    } finally {
      setPushing(false);
    }
  };

  // Disconnect / Change GitHub Repository
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await fetch('/api/github/disconnect', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRepoInput('');
        setSuccessMsg('GitHub Repository सफलतापूर्वक Disconnect गरियो। तपाईं अब नयाँ Repository जोड्न सक्नुहुन्छ।');
        await fetchStatus();
      }
    } catch (err: any) {
      setErrorMsg('Disconnect गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl rounded-3xl bg-[#08090f] border border-cyan-500/30 p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                GitHub Integration & Push
              </h2>
              <p className="text-xs text-zinc-400">
                Android APK अटोमेशन र कोड Repository व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="my-4 space-y-4 overflow-y-auto pr-1 flex-1 text-xs sm:text-sm">
          {/* Status Indicator Card (Prompt Requirement #10) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>रिपोजिटरी स्थिति (Repository Status)</span>
              </span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 p-1 rounded hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>रिफ्रेस</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Connected Status */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">GitHub स्थिति:</span>
                <span className="flex items-center gap-1 font-semibold">
                  {gitStatus?.connectedRepoName ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="text-zinc-500">Not Connected</span>
                  )}
                </span>
              </div>

              {/* Repository Name */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">Repository Name:</span>
                <span className="font-mono text-cyan-300 font-semibold truncate max-w-[150px]">
                  {gitStatus?.connectedRepoName || 'None'}
                </span>
              </div>

              {/* Last Push Timestamp */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">Last Push:</span>
                <span className="text-zinc-300 font-medium truncate max-w-[140px]">
                  {gitStatus?.lastPushDate
                    ? new Date(gitStatus.lastPushDate).toLocaleTimeString('ne-NP') + ' (' + new Date(gitStatus.lastPushDate).toLocaleDateString() + ')'
                    : 'कुनै पुश भएको छैन'}
                </span>
              </div>

              {/* Push Outcome */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-zinc-400">Push Status:</span>
                <span className="font-semibold flex items-center gap-1">
                  {gitStatus?.lastPushStatus === 'success' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                    </span>
                  ) : gitStatus?.lastPushStatus === 'failed' ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed
                    </span>
                  ) : (
                    <span className="text-zinc-400">Idle / Ready</span>
                  )}
                </span>
              </div>
            </div>

            {/* Change GitHub Button (Prompt Requirement #3 & #11) */}
            {gitStatus?.connectedRepoName && (
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                <a
                  href={`https://github.com/${gitStatus.connectedRepoName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>GitHub मा हेर्नुहोस् ({gitStatus.connectedRepoName})</span>
                </a>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading || pushing}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Change GitHub (अर्को रिपो जोड्नुहोस्)</span>
                </button>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successMsg}</p>
                <p className="text-[11px] text-emerald-400/80 mt-1">
                  GitHub Actions ले अब स्वचालित रूपमा Android APK कम्पाइल गर्दैछ! Repo को <b>Releases</b> वा <b>Actions</b> ट्याबमा हेर्नुहोस्।
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  यदि रिपो Private छ भने तलको <b>"GitHub Personal Access Token (PAT)"</b> विकल्प खोलेर टोकन राख्नुहोस्।
                </p>
              </div>
            </div>
          )}

          {/* Push Form */}
          <form onSubmit={handlePush} className="space-y-3.5">
            {/* Repository Input (Prompt Requirement #2) */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                GitHub Repository (Owner/Repository Name) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="उदा: bharatpun/bhapuma-ai वा https://github.com/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-cyan-500/30 focus:border-cyan-400 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  required
                />
                <Github className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Branch & Commit Message */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Branch</span>
                </label>
                <input
                  type="text"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Commit Message</span>
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 focus:border-cyan-400 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Secure Token Accordion (Prompt Requirement #12) */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-cyan-300 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Repo / GitHub Token (वैकल्पिक / Optional)</span>
                </span>
                <span className="text-[10px] text-cyan-400 underline">
                  {showTokenInput ? 'Hide' : 'Show'}
                </span>
              </button>

              {showTokenInput && (
                <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-1.5 animate-fadeIn">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx (Personal Access Token with 'repo' scope)"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-zinc-500">
                    * टोकन कोड वा फाइलमा कहिल्यै सेभ गरिँदैन। यो केवल Push प्रमाणीकरणका लागि प्रयोग हुन्छ।
                  </p>
                </div>
              )}
            </div>

            {/* Android & APK Build Integrity Checklist (Prompt Requirement #9) */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-zinc-300 space-y-1.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>APK Build Compatibility & Components:</span>
              </div>
              <ul className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AndroidManifest.xml
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Gradle 8.2 & Wrapper
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> GitHub Actions CI/CD
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Gemini & Voice Engine
                </li>
              </ul>
            </div>

            {/* Submit Push Button (Prompt Requirement #1 & #6) */}
            <button
              type="submit"
              disabled={pushing || loading || !repoInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {pushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing & Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Push Complete Android Project to GitHub</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto GitHub Actions CI/CD Enabled</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-all"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
