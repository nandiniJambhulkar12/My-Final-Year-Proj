import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  Info,
} from "lucide-react";

interface RiskData {
  id: string;
  lineNumber: number;
  riskType: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  category: string;
  explanation: string;
  exploitScenario: string;
  recommendedFix: string;
  confidence: number;
}

interface AuditReportProps {
  risks: RiskData[];
  codeContent?: string;
  analysisDate: Date;
}

const AuditReport: React.FC<AuditReportProps> = ({
  risks,
  codeContent,
  analysisDate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const generateReport = async (format: "pdf" | "excel" | "html") => {
    setIsGenerating(true);

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const reportContent = generateReportContent(format);
    setGeneratedReport(reportContent);
    setIsGenerating(false);

    // In a real implementation, you would generate and download the actual file
  };

  const generateReportContent = (format: string) => {
    const totalRisks = risks.length;
    const highRisks = risks.filter((r) => r.severity === "High").length;
    const mediumRisks = risks.filter((r) => r.severity === "Medium").length;
    const lowRisks = risks.filter((r) => r.severity === "Low").length;

    return `
# Code Risk Audit Report
Generated on: ${analysisDate.toLocaleDateString()}
Analysis Date: ${analysisDate.toLocaleString()}

## Executive Summary
- Total Risks Found: ${totalRisks}
- High Severity: ${highRisks}
- Medium Severity: ${mediumRisks}
- Low Severity: ${lowRisks}

## Detailed Findings
${risks
  .map(
    (risk) => `
### Risk ${risk.id}
- Line: ${risk.lineNumber}
- Type: ${risk.riskType}
- Severity: ${risk.severity}
- Description: ${risk.description}
- Explanation: ${risk.explanation}
- Recommended Fix: ${risk.recommendedFix}
`,
  )
  .join("\n")}

## Recommendations
1. Address all High severity risks immediately
2. Review Medium severity risks within 1 week
3. Consider Low severity risks for future improvements
    `;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "High":
        return <AlertTriangle className="w-4 h-4 text-danger-600" />;
      case "Medium":
        return <Shield className="w-4 h-4 text-warning-600" />;
      case "Low":
        return <Info className="w-4 h-4 text-success-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "High":
        return "severity-high";
      case "Medium":
        return "severity-medium";
      case "Low":
        return "severity-low";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Report Generation
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Generate comprehensive audit reports in multiple formats for
          documentation and compliance.
        </p>

        {/* Report Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Report Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analysis Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {analysisDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Analysis Time
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {analysisDate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Risks
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {risks.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Format
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateReport("pdf")}
              disabled={isGenerating || risks.length === 0}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              <span>PDF Report</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateReport("excel")}
              disabled={isGenerating || risks.length === 0}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Excel Report</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateReport("html")}
              disabled={isGenerating || risks.length === 0}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileCode className="w-5 h-5" />
              <span>HTML Report</span>
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Generating report...
              </span>
            </div>
          </motion.div>
        )}

        {/* Generated Report Preview */}
        {generatedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Preview
            </h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              <pre>{generatedReport}</pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Risk Summary Table */}
      {risks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Summary for Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Line
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Risk Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, index) => (
                  <motion.tr
                    key={risk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">
                      {risk.lineNumber}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {risk.riskType}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityClass(risk.severity)}`}
                      >
                        {getSeverityIcon(risk.severity)}
                        <span className="ml-1">{risk.severity}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {risk.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {risk.description}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {risks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No risks to report</p>
          <p className="text-sm">
            Upload and analyze code to generate audit reports
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AuditReport;
