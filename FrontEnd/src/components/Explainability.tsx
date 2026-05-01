import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Info, Code, Lightbulb, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface RiskData {
  id: string;
  lineNumber: number;
  riskType: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  category: string;
  source?: string;
  codeSnippet: string;
  explanation: string;
  exploitScenario: string;
  recommendedFix: string;
  confidence: number;
}

interface ExplainabilityProps {
  risks: RiskData[];
  selectedRiskId?: string;
  onRiskSelect: (riskId: string) => void;
}

const Explainability: React.FC<ExplainabilityProps> = ({ risks, selectedRiskId, onRiskSelect }) => {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(selectedRiskId || null);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-danger-600" />;
      case 'Medium': return <Shield className="w-5 h-5 text-warning-600" />;
      case 'Low': return <Info className="w-5 h-5 text-success-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'High': return 'severity-high';
      case 'Medium': return 'severity-medium';
      case 'Low': return 'severity-low';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success-600';
    if (confidence >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const toggleExpanded = (riskId: string) => {
    setExpandedRisk(expandedRisk === riskId ? null : riskId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Explainable AI Analysis
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Understand why each risk was flagged with detailed explanations, exploit scenarios, and recommended fixes.
        </p>

        <div className="space-y-4">
          {risks.map((risk, index) => (
            <motion.div
              key={risk.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 ${
                expandedRisk === risk.id ? 'shadow-lg' : 'hover:shadow-md'
              }`}
            >
              {/* Risk Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => toggleExpanded(risk.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(risk.severity)}
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                        Line {risk.lineNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {risk.riskType}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {risk.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityClass(risk.severity)}`}>
                      {risk.severity}
                    </span>
                    <span className={`text-sm font-medium ${getConfidenceColor(risk.confidence)}`}>
                      {risk.confidence}% confidence
                    </span>
                    {expandedRisk === risk.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRisk === risk.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="p-6 space-y-6">
                    {/* Code Snippet */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Code className="w-5 h-5 text-primary-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Code Snippet (Line {risk.lineNumber})
                        </h4>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="flex">
                          <div className="text-gray-500 mr-4 select-none">
                            {risk.lineNumber}
                          </div>
                          <div className="flex-1">
                            <code className="text-red-400">{risk.codeSnippet}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why Flagged */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-warning-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Why was this flagged?
                        </h4>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {risk.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Exploit Scenario */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <ExternalLink className="w-5 h-5 text-danger-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Potential Exploit Scenario
                        </h4>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-red-800 dark:text-red-200 leading-relaxed">
                          {risk.exploitScenario}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Fix */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-success-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Recommended Fix
                        </h4>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-200 leading-relaxed">
                          {risk.recommendedFix}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Category:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {risk.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Source File:
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {risk.source || 'Inline submission'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          AI Confidence:
                        </span>
                        <span className={`ml-2 font-medium ${getConfidenceColor(risk.confidence)}`}>
                          {risk.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {risks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No risks to explain</p>
            <p className="text-sm">Upload and analyze code to see explainable AI insights</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Explainability;
