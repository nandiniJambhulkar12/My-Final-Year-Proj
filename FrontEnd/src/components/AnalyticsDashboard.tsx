import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  Activity, Target, Calendar, Clock 
} from 'lucide-react';

interface RiskData {
  id: string;
  lineNumber: number;
  riskType: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  category: string;
  confidence: number;
  timestamp: Date;
}

interface AnalyticsDashboardProps {
  risks: RiskData[];
  historicalData?: any[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ risks, historicalData = [] }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'severity' | 'category' | 'trend'>('severity');

  // Calculate analytics data
  const totalRisks = risks.length;
  const highRisks = risks.filter(r => r.severity === 'High').length;
  const mediumRisks = risks.filter(r => r.severity === 'Medium').length;
  const lowRisks = risks.filter(r => r.severity === 'Low').length;

  // Risk distribution by category
  const categoryData = risks.reduce((acc, risk) => {
    const existing = acc.find(item => item.name === risk.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: risk.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Severity distribution
  const severityData = [
    { name: 'High', value: highRisks, color: '#ef4444' },
    { name: 'Medium', value: mediumRisks, color: '#f59e0b' },
    { name: 'Low', value: lowRisks, color: '#22c55e' }
  ];

  // Trend data (simulated)
  const trendData = [
    { date: '2025-01-01', risks: 12, high: 3, medium: 5, low: 4 },
    { date: '2025-01-02', risks: 15, high: 4, medium: 6, low: 5 },
    { date: '2025-01-03', risks: 18, high: 5, medium: 7, low: 6 },
    { date: '2025-01-04', risks: 14, high: 3, medium: 6, low: 5 },
    { date: '2025-01-05', risks: 20, high: 6, medium: 8, low: 6 },
    { date: '2025-01-06', risks: 16, high: 4, medium: 7, low: 5 },
    { date: '2025-01-07', risks: 22, high: 7, medium: 9, low: 6 },
  ];

  // Risk concentration heatmap data
  const heatmapData = risks.reduce((acc, risk) => {
    const lineRange = Math.floor(risk.lineNumber / 10) * 10;
    const existing = acc.find(item => item.lineRange === lineRange);
    if (existing) {
      existing.count += 1;
      if (risk.severity === 'High') existing.high += 1;
      else if (risk.severity === 'Medium') existing.medium += 1;
      else existing.low += 1;
    } else {
      acc.push({
        lineRange,
        count: 1,
        high: risk.severity === 'High' ? 1 : 0,
        medium: risk.severity === 'Medium' ? 1 : 0,
        low: risk.severity === 'Low' ? 1 : 0
      });
    }
    return acc;
  }, [] as { lineRange: number; count: number; high: number; medium: number; low: number }[]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="input-field w-auto"
            >
              <option value="severity">By Severity</option>
              <option value="category">By Category</option>
              <option value="trend">Trend Analysis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-primary-600 mr-2" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Risks</div>
          <div className="flex items-center justify-center mt-2 text-sm text-success-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% from last week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-danger-600 mr-2" />
            <span className="text-3xl font-bold text-danger-600">{highRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Critical Issues</div>
          <div className="flex items-center justify-center mt-2 text-sm text-danger-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+3 this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-warning-600 mr-2" />
            <span className="text-3xl font-bold text-warning-600">{mediumRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Medium Priority</div>
          <div className="flex items-center justify-center mt-2 text-sm text-warning-600">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>-2 this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-success-600 mr-2" />
            <span className="text-3xl font-bold text-success-600">{lowRisks}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Low Priority</div>
          <div className="flex items-center justify-center mt-2 text-sm text-success-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5 this week</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Severity Distribution
            </h3>
          </div>
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

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Categories
            </h3>
          </div>
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

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Risk Trends Over Time
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Concentration Heatmap */}
      {heatmapData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Concentration Heatmap
            </h3>
          </div>
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 100 }, (_, i) => {
              const lineRange = i * 10;
              const data = heatmapData.find(d => d.lineRange === lineRange);
              const intensity = data ? Math.min(data.count / 5, 1) : 0;
              const hasHighRisk = data?.high > 0;
              
              return (
                <div
                  key={i}
                  className={`h-8 rounded text-xs flex items-center justify-center font-medium ${
                    hasHighRisk
                      ? 'bg-red-500 text-white'
                      : intensity > 0.5
                      ? 'bg-orange-400 text-white'
                      : intensity > 0.2
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                  title={`Lines ${lineRange}-${lineRange + 9}: ${data?.count || 0} risks`}
                >
                  {data?.count || ''}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <span>No risks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Low concentration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Medium concentration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>High risk present</span>
            </div>
          </div>
        </motion.div>
      )}

      {risks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No analytics data available</p>
          <p className="text-sm">Upload and analyze code to see detailed analytics</p>
        </div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;
