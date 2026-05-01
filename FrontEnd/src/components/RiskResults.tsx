import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, CheckCircle, Info } from 'lucide-react';

interface RiskData {
  id: string;
  lineNumber: number;
  riskType: string;
  severity: 'High' | 'Medium' | 'Low';
  cwe?: string;
  description: string;
  source?: string;
  category: string;
}

interface DatasetRisk {
  available?: boolean;
  inferred_cwe?: string | null;
  inferred_risk_level?: string | null;
  rationale?: string | null;
  matches?: any[];
}

interface RiskResultsProps {
  risks: RiskData[];
  datasetRisk?: DatasetRisk | null;
  isLoading?: boolean;
  onRiskClick?: (riskId: string) => void;
}

const RiskResults: React.FC<RiskResultsProps> = ({ risks, datasetRisk = null, isLoading = false, onRiskClick }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics
  const totalRisks = risks.length;
  const highRisks = risks.filter(r => r.severity === 'High').length;
  const mediumRisks = risks.filter(r => r.severity === 'Medium').length;
  const lowRisks = risks.filter(r => r.severity === 'Low').length;

  // Chart data
  const severityData = [
    { name: 'High', value: highRisks, color: '#ef4444' },
    { name: 'Medium', value: mediumRisks, color: '#f59e0b' },
    { name: 'Low', value: lowRisks, color: '#22c55e' }
  ];

  const categoryData = risks.reduce((acc, risk) => {
    const existing = acc.find(item => item.name === risk.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: risk.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Filter risks
  const filteredRisks = risks.filter(risk => {
    const matchesSeverity = selectedSeverity === 'All' || risk.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'All' || risk.category === selectedCategory;
    const desc = (risk.description || '').toLowerCase();
    const type = (risk.riskType || '').toLowerCase();
    const matchesSearch = desc.includes(searchTerm.toLowerCase()) ||
                         type.includes(searchTerm.toLowerCase()) ||
                         (risk.lineNumber ? risk.lineNumber.toString().includes(searchTerm) : false);
    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <AlertTriangle className="w-4 h-4" />;
      case 'Medium': return <Shield className="w-4 h-4" />;
      case 'Low': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {totalRisks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total Risks Found
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-danger-600 mr-2" />
            <span className="text-3xl font-bold text-danger-600">{highRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            High Severity
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-warning-600 mr-2" />
            <span className="text-3xl font-bold text-warning-600">{mediumRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Medium Severity
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Info className="w-6 h-6 text-success-600 mr-2" />
            <span className="text-3xl font-bold text-success-600">{lowRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Low Severity
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Categories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search risks by description, type, or line number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input-field w-auto"
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-auto"
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(risks.map(r => r.category))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Risk Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Line</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Risk Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CWE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk, index) => (
                  <motion.tr
                  key={risk.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                    onClick={() => onRiskClick?.(risk.id)}
                    role="button"
                    tabIndex={0}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">
                    {risk.lineNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {risk.riskType}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityClass(risk.severity)}`}>
                      {getSeverityIcon(risk.severity)}
                      <span className="ml-1">{risk.severity}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">
                    {risk.cwe}
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">
                    {risk.source}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {risk.description}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRisks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No risks found matching your criteria.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RiskResults;
