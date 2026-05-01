import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { apiFetch } from "../utils/api";

interface Analysis {
  id: string;
  language: string;
  risk_level: "High" | "Medium" | "Low";
  vulnerability_count: number;
  analysis_date: string;
  findings: any[];
}

interface AnalysisHistoryProps {
  onViewDetails?: (analysis: Analysis) => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ onViewDetails }) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token for debugging
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await apiFetch("/api/history/", {
        method: "GET",
      });

      // Handle both direct array and nested data structure
      const historyData = Array.isArray(response)
        ? response
        : response.data || response;

      setAnalyses(Array.isArray(historyData) ? historyData : []);
    } catch (err: any) {
      console.error("Failed to load analysis history:", err);
      const errorMessage = err.message || "Failed to load analysis history";
      setError(errorMessage);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) {
      return;
    }

    try {
      setDeleting(id);
      await apiFetch(`/api/history/${id}`, {
        method: "DELETE",
      });
      setAnalyses(analyses.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete analysis");
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetails = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetails(true);
    onViewDetails?.(analysis);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "Low":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return <AlertTriangle size={16} />;
      case "Medium":
        return <AlertCircle size={16} />;
      case "Low":
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader size={40} className="text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analysis History
        </h2>
        <button
          onClick={loadAnalysisHistory}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No analysis history yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Your code analyses will appear here
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Language
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Risk Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Vulnerabilities
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analyses.map((analysis, index) => (
                <motion.tr
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(analysis.analysis_date)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      {analysis.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${getRiskColor(
                        analysis.risk_level,
                      )}`}
                    >
                      {getRiskIcon(analysis.risk_level)}
                      <span className="font-medium text-xs">
                        {analysis.risk_level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">
                      {analysis.vulnerability_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleViewDetails(analysis)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        disabled={deleting === analysis.id}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete analysis"
                      >
                        {deleting === analysis.id ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Analysis Details - {selectedAnalysis.language.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedAnalysis.analysis_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Risk Level
                  </p>
                  <div
                    className={`flex items-center gap-2 w-fit ${getRiskColor(selectedAnalysis.risk_level)}`}
                  >
                    {getRiskIcon(selectedAnalysis.risk_level)}
                    <span className="font-medium text-sm">
                      {selectedAnalysis.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Findings ({selectedAnalysis.findings.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedAnalysis.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {finding.risk_type || finding.issue || "Issue"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {finding.description ||
                              finding.explanation ||
                              "No description"}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            finding.severity === "High"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : finding.severity === "Medium"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {finding.severity || "Medium"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisHistory;
