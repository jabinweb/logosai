'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TrainingStats {
  totalDataPoints: number;
  byLanguage: Record<string, number>;
  byCategory: Record<string, number>;
  recentFeedback: { helpful: number; not_helpful: number; incorrect: number };
}

interface ModelPerformance {
  accuracy: number;
  languageConsistency: number;
  biblicalAccuracy: number;
  userSatisfaction: number;
  recommendations: string[];
}

interface OptimizedPrompts {
  basePrompt: string;
  languagePrompts: Record<string, string>;
  improvementSuggestions: string[];
}

const AITrainingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'performance' | 'export'>('overview');
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [performance, setPerformance] = useState<ModelPerformance | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [exportFormat, setExportFormat] = useState<'jsonl' | 'csv' | 'txt'>('jsonl');
  const [optimizedPrompts, setOptimizedPrompts] = useState<OptimizedPrompts | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [statsResponse, performanceResponse] = await Promise.all([
        fetch('/api/training?action=stats'),
        fetch('/api/training?action=performance')
      ]);

      if (!statsResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch training data');
      }

      const [statsData, performanceData] = await Promise.all([
        statsResponse.json(),
        performanceResponse.json()
      ]);

      setStats(statsData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateOptimizedPrompts = async () => {
    try {
      setIsTraining(true);
      const response = await fetch('/api/training?action=prompts');
      
      if (!response.ok) {
        throw new Error('Failed to generate optimized prompts');
      }
      
      const prompts = await response.json();
      setOptimizedPrompts(prompts);
    } catch (error) {
      console.error('Error generating prompts:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const exportTrainingData = async () => {
    try {
      const response = await fetch(`/api/training?action=export&format=${exportFormat}`);
      
      if (!response.ok) {
        throw new Error('Failed to export training data');
      }
      
      const data = await response.text();
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Training Data</h3>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {stats?.totalDataPoints || 0}
        </div>
        <p className="text-gray-600 dark:text-gray-300">Total data points collected</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Languages</h3>
        <div className="space-y-2">
          {stats?.byLanguage && Object.entries(stats.byLanguage).map(([lang, count]) => (
            <div key={lang} className="flex justify-between">
              <span className="capitalize text-gray-700 dark:text-gray-300">{lang}</span>
              <span className="font-medium text-gray-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Feedback</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">Helpful</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats?.recentFeedback.helpful || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">Not Helpful</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats?.recentFeedback.not_helpful || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 dark:text-red-400">Incorrect</span>
            <span className="font-medium text-gray-900 dark:text-white">{stats?.recentFeedback.incorrect || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Model Optimization</h3>
        <div className="flex space-x-4">
          <button
            onClick={generateOptimizedPrompts}
            disabled={isTraining}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isTraining ? 'Generating...' : 'Generate Optimized Prompts'}
          </button>
        </div>
        
        {optimizedPrompts && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Base Prompt</h4>
              <textarea
                value={optimizedPrompts.basePrompt}
                readOnly
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-24 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Language-Specific Prompts</h4>
              {Object.entries(optimizedPrompts.languagePrompts).map(([lang, prompt]) => (
                <div key={lang} className="mb-3">
                  <label className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">{lang}</label>
                  <textarea
                    value={prompt as string}
                    readOnly
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm h-20 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Improvement Suggestions</h4>
              <ul className="list-disc list-inside space-y-1">
                {optimizedPrompts.improvementSuggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Model Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {performance?.accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Overall Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {performance?.languageConsistency.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Language Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {performance?.biblicalAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Biblical Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {performance?.userSatisfaction.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">User Satisfaction</div>
          </div>
        </div>
      </div>

      {performance?.recommendations && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommendations</h3>
          <ul className="space-y-2">
            {performance.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500 dark:text-yellow-400 mt-1">⚡</span>
                <span className="text-gray-700 dark:text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderExportTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Export Training Data</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Export Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'jsonl' | 'csv' | 'txt')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="jsonl">JSON Lines (.jsonl) - For GPT/Claude training</option>
              <option value="csv">CSV (.csv) - For data analysis</option>
              <option value="txt">Text (.txt) - Human readable format</option>
            </select>
          </div>
          
          {stats && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Export Preview:</strong> Approximately {stats.totalDataPoints} training data entries will be exported.
                This includes all entries with user feedback regardless of validation status.
              </p>
            </div>
          )}
          
          <button
            onClick={exportTrainingData}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Export Training Data ({stats?.totalDataPoints || 0} entries)
          </button>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p><strong className="text-gray-900 dark:text-white">Note:</strong> Exported data can be used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Fine-tune OpenAI GPT models</li>
              <li>Train custom models with Hugging Face</li>
              <li>Analyze user interaction patterns</li>
              <li>Share with external training services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Model Training Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Monitor and improve your AI model performance</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'training', label: 'Training', icon: '🧠' },
            { id: 'performance', label: 'Performance', icon: '📈' },
            { id: 'export', label: 'Export', icon: '📤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'training' | 'performance' | 'export')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'training' && renderTrainingTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'export' && renderExportTab()}
      </div>
    </div>
  );
};

export default AITrainingDashboard;
