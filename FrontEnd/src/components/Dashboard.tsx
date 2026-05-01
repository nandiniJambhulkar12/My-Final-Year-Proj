import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  type LucideIcon,
  Home,
  Loader,
  Upload,
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch, postBackendLogin } from "../utils/api";
import Navigation from "./Navigation";
import CodeInput from "./CodeInput";
import RiskResults from "./RiskResults";
import Explainability from "./Explainability";
import AnalysisHistory from "./AnalysisHistory";
import MyProfile from "./MyProfile";
import ContactSupport from "./ContactSupport";

type HistoryEntry = {
  id: string;
  language: string;
  risk_level: "High" | "Medium" | "Low";
  vulnerability_count: number;
  analysis_date: string;
  findings: any[];
};

type DashboardStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
};

type AnalyzeSubmitPayload = {
  code?: string;
  files?: File[];
};

type AnalyzeReport = {
  file_name: string;
  dataset_risk?: {
    rationale?: string | null;
  } | null;
  findings?: any[];
  history_id?: string | null;
};

const emptyStats: DashboardStat[] = [
  {
    label: "Total Analyses",
    value: "0",
    icon: BarChart3,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Vulnerabilities Found",
    value: "0",
    icon: Zap,
    color: "from-red-500 to-red-600",
  },
  {
    label: "High Risk Scans",
    value: "0",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-600",
  },
  {
    label: "Security Score",
    value: "100%",
    icon: Brain,
    color: "from-emerald-500 to-green-600",
  },
];

async function getOrRefreshBackendToken(
  apiBase: string,
  user: any,
): Promise<string> {
  let token = localStorage.getItem("userToken");

  if (!token && user?.uid) {
    const idToken = await user.getIdToken();
    const loginRes = await postBackendLogin(apiBase, {
      id_token: idToken,
    });

    if (!loginRes.ok) {
      let detail = "Backend authentication failed";
      try {
        const error = await loginRes.json();
        detail = error.detail || detail;
      } catch {
        detail = await loginRes.text();
      }
      throw new Error(detail || "Backend authentication failed");
    }

    const data = await loginRes.json();
    token = data.access_token;
    localStorage.setItem("userToken", token);
  }

  if (!token) {
    throw new Error("Not authenticated - please log in to your account");
  }

  return token;
}

function buildDashboardStats(history: HistoryEntry[]): DashboardStat[] {
  const totalAnalyses = history.length;
  const vulnerabilitiesFound = history.reduce(
    (sum, entry) => sum + (entry.vulnerability_count || 0),
    0,
  );
  const highRiskScans = history.filter(
    (entry) => entry.risk_level === "High",
  ).length;
  const mediumRiskScans = history.filter(
    (entry) => entry.risk_level === "Medium",
  ).length;
  const lowRiskScans = history.filter(
    (entry) => entry.risk_level === "Low",
  ).length;
  const penalty =
    highRiskScans * 18 +
    mediumRiskScans * 10 +
    lowRiskScans * 4 +
    vulnerabilitiesFound * 2;
  const securityScore = Math.max(
    5,
    Math.min(100, totalAnalyses === 0 ? 100 : 100 - penalty),
  );

  return [
    {
      label: "Total Analyses",
      value: totalAnalyses.toString(),
      icon: BarChart3,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Vulnerabilities Found",
      value: vulnerabilitiesFound.toString(),
      icon: Zap,
      color: "from-red-500 to-red-600",
    },
    {
      label: "High Risk Scans",
      value: highRiskScans.toString(),
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "Security Score",
      value: `${securityScore}%`,
      icon: Brain,
      color: "from-emerald-500 to-green-600",
    },
  ];
}

function getRiskBadgeClass(level: string): string {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "Medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "Low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  }
}

function formatActivityDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeFindings(report: AnalyzeReport, reportIndex: number) {
  return (report.findings || []).map((finding: any, idx: number) => {
    let exploitScenario = finding.exploit_scenario || "";
    let recommendedFix = finding.fix_suggestion || "";

    if (report.dataset_risk?.rationale && !exploitScenario) {
      exploitScenario = report.dataset_risk.rationale;
    }

    return {
      id: `${reportIndex}-${finding.id || idx.toString()}`,
      lineNumber: finding.line || finding.lineNumber || 0,
      riskType:
        finding.risk_type ||
        finding.issue ||
        finding.riskType ||
        "Potential vulnerability",
      severity: finding.severity || "Medium",
      cwe: finding.cwe || "",
      description: finding.description || finding.explanation || "",
      source: report.file_name || finding.source || finding.standard || "",
      category: finding.category || finding.standard || "General",
      explanation:
        finding.explanation ||
        "This issue was detected by our AI analysis system.",
      exploitScenario:
        exploitScenario ||
        "A potential exploit could involve leveraging this vulnerability to compromise system security.",
      recommendedFix:
        recommendedFix ||
        "Review the highlighted code and implement proper security controls.",
      confidence: finding.model_confidence || finding.confidence || 75,
      codeSnippet: finding.codeSnippet || "",
      timestamp: new Date(),
    };
  });
}

const Dashboard: React.FC = () => {
  const { user, backendUser } = useAuth();
  const userEmail = user?.email || null;
  const userUid = user?.uid || null;
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [datasetRisk, setDatasetRisk] = useState<any>(null);
  const [selectedRiskId, setSelectedRiskId] = useState<string | undefined>(
    undefined,
  );
  const [language, setLanguage] = useState("auto");
  const [stats, setStats] = useState<DashboardStat[]>(emptyStats);
  const [recentAnalyses, setRecentAnalyses] = useState<HistoryEntry[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Prevent duplicate requests
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const isSubmittingRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      if (!userEmail || !userUid) {
        if (isMounted) {
          setStats(emptyStats);
          setRecentAnalyses([]);
          setDashboardLoading(false);
        }
        return;
      }

      try {
        setDashboardLoading(true);
        setDashboardError(null);

        const apiBase =
          process.env.REACT_APP_API_URL || "http://localhost:8000";
        await getOrRefreshBackendToken(apiBase, {
          email: userEmail,
          uid: userUid,
        });
        const response = await apiFetch("/api/history/", { method: "GET" });
        const history = Array.isArray(response)
          ? response
          : response.data || [];

        if (!isMounted) {
          return;
        }

        setStats(buildDashboardStats(history));
        setRecentAnalyses(history.slice(0, 3));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";
        setDashboardError(message);
        setStats(emptyStats);
        setRecentAnalyses([]);
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
      // Cancel any pending analysis request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userEmail, userUid]);

  const handleAnalyzeSubmit = async ({
    code,
    files = [],
  }: AnalyzeSubmitPayload) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isAnalyzing) {
      console.warn("Analysis already in progress");
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isSubmittingRef.current = true;
    abortControllerRef.current = new AbortController();
    setIsAnalyzing(true);

    try {
      const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const token = await getOrRefreshBackendToken(apiBase, user);

      let response: Response;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("language", language || "auto");
        if (code?.trim()) {
          formData.append("code", code);
        }

        response = await fetch(`${apiBase}/api/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: abortControllerRef.current.signal,
        });
      } else if (code?.trim()) {
        const formData = new FormData();
        formData.append("code", code);
        formData.append("language", language || "auto");

        response = await fetch(`${apiBase}/api/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: abortControllerRef.current.signal,
        });
      } else {
        throw new Error("Please provide code or a source file to analyze.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API error: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        console.error("Analysis error:", errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();

      const risks = normalizeFindings(result, 0);

      if (result.history_id) {
        localStorage.setItem("lastAnalysisId", result.history_id);
      }

      setDatasetRisk(result.dataset_risk || null);
      setAnalysisResults({
        risks,
        analysisDate: new Date(),
        codeContent: files.length > 0 ? files[0].name : code,
      });

      // Defer history refresh to background after showing results
      // This ensures only 1 request (analysis) goes to Gemini per file
      setTimeout(async () => {
        try {
          const historyResponse = await apiFetch("/api/history/", {
            method: "GET",
          });
          const history = Array.isArray(historyResponse)
            ? historyResponse
            : historyResponse.data || [];
          setStats(buildDashboardStats(history));
          setRecentAnalyses(history.slice(0, 3));
          setDashboardError(null);
        } catch (historyError) {
          console.error("Failed to refresh dashboard history:", historyError);
        }
      }, 1000);

      setActiveSection("analyze");
    } catch (error) {
      // Only show error if not aborted
      if (error instanceof Error && error.name !== "AbortError") {
        const errorMessage = error.message;
        alert("Failed to analyze code: " + errorMessage);
        console.error("Full error:", error);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <Navigation
        onNavigation={setActiveSection}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <main className="pt-16 lg:ml-64 min-h-[calc(100vh-64px)]">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dashboard Home */}
            {activeSection === "dashboard" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome,{" "}
                    {user?.displayName || user?.email?.split("@")[0] || "User"}!
                    👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Here's an overview of your code analysis activity
                  </p>
                  {backendUser && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Account status:{" "}
                      {backendUser.verified
                        ? "Verified"
                        : "Pending verification"}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                {dashboardError && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    {dashboardError}
                  </div>
                )}

                {dashboardLoading ? (
                  <div className="flex h-40 items-center justify-center rounded-xl bg-white shadow-lg dark:bg-gray-800">
                    <Loader size={32} className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.label}
                              </p>
                              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                {stat.value}
                              </p>
                            </div>
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                            >
                              <Icon size={28} className="text-white" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("analyze")}
                  >
                    <Upload size={32} className="mb-3" />
                    <h3 className="text-xl font-bold mb-2">Analyze Code</h3>
                    <p className="text-blue-100">
                      Submit code for security analysis and get instant results
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("history")}
                  >
                    <BarChart3 size={32} className="mb-3" />
                    <h3 className="text-xl font-bold mb-2">View History</h3>
                    <p className="text-purple-100">
                      Check your previous analyses and results
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setActiveSection("profile")}
                  >
                    <Home size={32} className="mb-3" />
                    <h3 className="text-xl font-bold mb-2">My Profile</h3>
                    <p className="text-green-100">
                      Update your account information and preferences
                    </p>
                  </motion.div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Recent Activity
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your latest scans pulled from backend history
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection("history")}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      View all
                    </button>
                  </div>

                  {recentAnalyses.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      No analysis history yet. Run your first scan to populate
                      this dashboard.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentAnalyses.map((analysis) => (
                        <div
                          key={analysis.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {analysis.language.toUpperCase()} scan
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatActivityDate(analysis.analysis_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskBadgeClass(analysis.risk_level)}`}
                            >
                              {analysis.risk_level}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {analysis.vulnerability_count} issues
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Did you know?
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Our AI uses explainable methods to identify vulnerabilities
                    with 95%+ accuracy. You can understand exactly why each
                    issue was flagged!
                  </p>
                </motion.div>
              </div>
            )}

            {/* Analyze Code Section */}
            {activeSection === "analyze" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Analyze Code
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Submit code for comprehensive security analysis
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Programming Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    aria-label="Programming language"
                    title="Programming language"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="auto">✨ Auto Detect</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {language === "auto"
                      ? "Language will be detected automatically from the code content or file extension."
                      : "Override used for pasted code. Uploaded files are always auto-detected per file."}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <CodeInput
                      onAnalyzeSubmit={handleAnalyzeSubmit}
                      isLoading={isAnalyzing}
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg h-fit">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                      Analysis Features
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Security Vulnerabilities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Code Quality Issues
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Performance Problems
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Best Practice Violations
                      </li>
                    </ul>
                  </div>
                </div>

                {analysisResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        ✓ Analysis complete! Scroll down to see results.
                      </p>
                    </div>

                    <RiskResults
                      risks={analysisResults.risks}
                      onRiskClick={(id: string) => {
                        setSelectedRiskId(id);
                        setActiveSection("explain");
                      }}
                    />
                    {datasetRisk?.rationale && (
                      <div
                        className={`rounded-xl border p-4 text-sm ${
                          datasetRisk.source === "local-fallback"
                            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                            : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle size={18} className="mt-0.5" />
                          <div>
                            <p className="font-semibold">
                              {datasetRisk.source === "local-fallback"
                                ? "Local Analysis Mode"
                                : "Analysis Note"}
                            </p>
                            <p>{datasetRisk.rationale}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Explainability */}
            {activeSection === "explain" && (
              <Explainability
                risks={analysisResults?.risks || []}
                selectedRiskId={selectedRiskId}
                onRiskSelect={(id: string) => setSelectedRiskId(id)}
              />
            )}

            {/* Analysis History */}
            {activeSection === "history" && <AnalysisHistory />}

            {/* My Profile */}
            {activeSection === "profile" && <MyProfile />}

            {/* Contact/Support */}
            {activeSection === "contact" && <ContactSupport />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
