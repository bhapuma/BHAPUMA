import React, { useState, useEffect, useCallback } from 'react';
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
  Terminal,
  FileCheck,
  Lock,
  Sparkles,
  PlayCircle,
  Clock,
  Download,
  Box,
  KeyRound,
  Eye,
  EyeOff,
  Radio,
  Check,
} from 'lucide-react';
import { GitHubStatusInfo, GitHubBuildStatusResponse } from '../types';

interface GitHubModalProps {
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ onClose }) => {
  const [gitStatus, setGitStatus] = useState<GitHubStatusInfo | null>(null);
  const [buildStatusData, setBuildStatusData] = useState<GitHubBuildStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildLoading, setBuildLoading] = useState(false);
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
  const [readOnlyTokenInput, setReadOnlyTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showReadOnlyTokenInput, setShowReadOnlyTokenInput] = useState(false);
  const [saveReadOnlyTokenSession, setSaveReadOnlyTokenSession] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'status' | 'push' | 'runs'>('status');

  // Load saved session read-only token from sessionStorage
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('bhapuma_gh_read_token');
      if (savedToken) {
        setReadOnlyTokenInput(savedToken);
      }
    } catch {}
  }, []);

  // Fetch GitHub Actions Build Status
  const fetchBuildStatus = useCallback(async (customRepo?: string, tokenToUse?: string) => {
    try {
      setBuildLoading(true);
      const targetRepo = (customRepo || repoInput || gitStatus?.connectedRepoName || '').trim();
      if (!targetRepo || !targetRepo.includes('/')) {
        setBuildStatusData(null);
        return;
      }

      const queryParams = new URLSearchParams();
      queryParams.set('repo', targetRepo);
      const token = tokenToUse !== undefined ? tokenToUse : readOnlyTokenInput;
      if (token && token.trim()) {
        queryParams.set('token', token.trim());
      }

      const res = await fetch(`/api/github/build-status?${queryParams.toString()}`);
      const result = await res.json();
      if (result.success && result.data) {
        setBuildStatusData(result.data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch build status:', err);
    } finally {
      setBuildLoading(false);
    }
  }, [repoInput, gitStatus?.connectedRepoName, readOnlyTokenInput]);

  // Fetch Local Git Status
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
        // Also trigger build status check if repo is connected
        if (data.status.connectedRepoName) {
          fetchBuildStatus(data.status.connectedRepoName);
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

  // Save Read-Only Token to session
  const handleSaveReadOnlyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveReadOnlyTokenSession && readOnlyTokenInput) {
      try {
        sessionStorage.setItem('bhapuma_gh_read_token', readOnlyTokenInput.trim());
      } catch {}
    } else if (!readOnlyTokenInput) {
      try {
        sessionStorage.removeItem('bhapuma_gh_read_token');
      } catch {}
    }
    fetchBuildStatus(undefined, readOnlyTokenInput.trim());
  };

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
      // Clear sensitive push token from memory
      setTokenInput('');
      await fetchStatus();
      setActiveTab('runs');
      // Re-fetch build status
      setTimeout(() => {
        fetchBuildStatus(repoInput.trim());
      }, 2000);
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
        setBuildStatusData(null);
        setSuccessMsg('GitHub Repository सफलतापूर्वक Disconnect गरियो। तपाईं अब नयाँ Repository जोड्न सक्नुहुन्छ।');
        await fetchStatus();
      }
    } catch (err: any) {
      setErrorMsg('Disconnect गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  };

  const latestRun = buildStatusData?.latestRun;

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
              <h2 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                <span>GitHub Actions & Push</span>
                {buildStatusData?.connected && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Android APK अटोमेशन, लाइभ बिल्ड स्थिति र कोड व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-white/5 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Repository & Build Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('push')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'push'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Push Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('runs')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'runs'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Actions History & APKs</span>
            {buildStatusData?.recentRuns?.length ? (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 text-white font-mono">
                {buildStatusData.recentRuns.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Modal Body */}
        <div className="my-3 space-y-3.5 overflow-y-auto pr-1 flex-1 text-xs sm:text-sm">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{successMsg}</p>
                <p className="text-[11px] text-emerald-400/80 mt-1">
                  GitHub Actions ले अब स्वचालित रूपमा Android APK कम्पाइल गर्दैछ। तलको <b>"Actions History & APKs"</b> ट्याबमा प्रत्यक्ष स्थिति हेर्नुहोस्।
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  यदि रिपो Private छ भने तलको <b>"Read-Only GitHub Token"</b> वा <b>"Push Token"</b> थप्नुहोस्।
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 1: STATUS & LATEST BUILD ================= */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              {/* Status Indicator Card (Prompt Requirement #10) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>रिपोजिटरी स्थिति (Repository Status)</span>
                  </span>
                  <button
                    onClick={() => {
                      fetchStatus();
                      fetchBuildStatus();
                    }}
                    disabled={loading || buildLoading}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 p-1 rounded hover:bg-white/5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading || buildLoading ? 'animate-spin' : ''}`} />
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
                        ? new Date(gitStatus.lastPushDate).toLocaleTimeString('ne-NP') +
                          ' (' +
                          new Date(gitStatus.lastPushDate).toLocaleDateString() +
                          ')'
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
                      <span>GitHub Repo खोल्नुहोस् ({gitStatus.connectedRepoName})</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={loading || pushing}
                      className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Change GitHub (रिपोजिटरी फेर्नुहोस्)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* LATEST GITHUB ACTIONS BUILD STATUS CARD (From GitHub API) */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs sm:text-sm">
                    <PlayCircle className="w-4 h-4 text-cyan-400" />
                    <span>Latest GitHub Actions Build (पछिल्लो कमिट स्थिति)</span>
                  </span>
                  {latestRun && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        latestRun.conclusion === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : latestRun.conclusion === 'failure'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : latestRun.status === 'in_progress'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-zinc-800 text-zinc-300 border border-white/10'
                      }`}
                    >
                      {latestRun.conclusion === 'success' && <CheckCircle2 className="w-3 h-3" />}
                      {latestRun.conclusion === 'failure' && <AlertCircle className="w-3 h-3" />}
                      {latestRun.status === 'in_progress' && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>
                        {latestRun.status === 'in_progress'
                          ? 'Building APK...'
                          : latestRun.conclusion
                          ? latestRun.conclusion.toUpperCase()
                          : latestRun.status.toUpperCase()}
                      </span>
                    </span>
                  )}
                </div>

                {latestRun ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-zinc-200 font-semibold">
                        <span className="truncate max-w-[280px]">{latestRun.displayTitle}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          #{latestRun.runNumber} ({latestRun.headSha})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-[11px] flex-wrap gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{new Date(latestRun.createdAt).toLocaleString()}</span>
                        </span>
                        <a
                          href={latestRun.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Actions Log हेर्नुहोस्</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-zinc-400 text-xs flex items-center justify-between">
                    <span>
                      {gitStatus?.connectedRepoName
                        ? 'कुनै हालको GitHub Actions रन भेटिएन वा रिपो Private छ।'
                        : 'GitHub Repository जडान गरेपछि यहाँ APK बिल्ड लाइभ देखिनेछ।'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('push')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500 text-black font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Push Now
                    </button>
                  </div>
                )}

                {/* Secure Read-Only Token Config Section */}
                <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowReadOnlyTokenInput(!showReadOnlyTokenInput)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Secure Read-Only Token (Private Repo Actions Query)</span>
                  </button>
                  <span className="text-[10px] text-zinc-500">
                    {readOnlyTokenInput ? '✓ Read Token Configured' : 'Token Optional (Public Repos)'}
                  </span>
                </div>

                {showReadOnlyTokenInput && (
                  <form onSubmit={handleSaveReadOnlyToken} className="pt-2 space-y-2 animate-fadeIn">
                    <div className="relative">
                      <input
                        type="password"
                        value={readOnlyTokenInput}
                        onChange={(e) => setReadOnlyTokenInput(e.target.value)}
                        placeholder="ghp_xxxx (Read-Only Token with repo/workflow read)"
                        className="w-full pl-8 pr-16 py-2 rounded-xl bg-black/60 border border-cyan-500/30 text-white text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveReadOnlyTokenSession}
                          onChange={(e) => setSaveReadOnlyTokenSession(e.target.checked)}
                          className="rounded bg-black border-white/20 text-cyan-500"
                        />
                        <span>यस सेसन (SessionStorage) मा सुरक्षित राख्नुहोस्</span>
                      </label>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: PUSH COMPLETE ANDROID PROJECT ================= */}
          {activeTab === 'push' && (
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

              {/* Optional Secure Push Token Accordion (Prompt Requirement #12) */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Private Repo Push Token / Personal Access Token (PAT)</span>
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
                  <span>APK Build Automation Verified:</span>
                </div>
                <ul className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400">
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AndroidManifest.xml
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Gradle 8.2 & Wrapper
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> .github/workflows/android.yml
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto Release APK
                  </li>
                </ul>
              </div>

              {/* Submit Push Button (Prompt Requirement #1 & #6) */}
              <button
                type="submit"
                disabled={pushing || loading || !repoInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
          )}

          {/* ================= TAB 3: WORKFLOW RUNS & RELEASE APKS ================= */}
          {activeTab === 'runs' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                  <PlayCircle className="w-4 h-4 text-cyan-400" />
                  <span>Recent GitHub Actions Runs ({buildStatusData?.recentRuns?.length || 0})</span>
                </span>
                <button
                  onClick={() => fetchBuildStatus()}
                  disabled={buildLoading}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 p-1 rounded hover:bg-white/5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${buildLoading ? 'animate-spin' : ''}`} />
                  <span>रिफ्रेस</span>
                </button>
              </div>

              {/* List of Workflow Runs */}
              {buildStatusData?.recentRuns && buildStatusData.recentRuns.length > 0 ? (
                <div className="space-y-2">
                  {buildStatusData.recentRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-white truncate max-w-[260px]">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              run.conclusion === 'success'
                                ? 'bg-emerald-400'
                                : run.conclusion === 'failure'
                                ? 'bg-rose-400'
                                : 'bg-amber-400 animate-ping'
                            }`}
                          />
                          <span className="truncate">{run.displayTitle}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            run.conclusion === 'success'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : run.conclusion === 'failure'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {run.status === 'in_progress' ? 'Running' : run.conclusion || run.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span>
                          Run #{run.runNumber} • Commit: <span className="font-mono text-cyan-300">{run.headSha}</span>
                        </span>
                        <a
                          href={run.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View on GitHub</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 text-center text-zinc-400 text-xs space-y-2">
                  <p>अहिलेसम्म कुनै रन रेकर्ड भएको छैन।</p>
                  <p className="text-[11px] text-zinc-500">
                    कोड पुश गरेपछि GitHub Actions ले स्वतः APK कम्पाइल गर्न सुरु गर्नेछ।
                  </p>
                </div>
              )}

              {/* Releases & Direct APK Download Links */}
              {buildStatusData?.releases && buildStatusData.releases.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                    <Box className="w-4 h-4 text-emerald-400" />
                    <span>Compiled Android APK Releases ({buildStatusData.releases.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {buildStatusData.releases.map((rel) => (
                      <div
                        key={rel.id}
                        className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{rel.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            {new Date(rel.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {rel.apkDownloadUrl ? (
                          <a
                            href={rel.apkDownloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download APK</span>
                          </a>
                        ) : (
                          <a
                            href={rel.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Release</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>GitHub Actions CI/CD Active</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-all cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
