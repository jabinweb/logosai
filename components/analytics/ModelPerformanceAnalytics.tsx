'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceData {
  date: string;
  accuracy: number;
  languageConsistency: number;
  biblicalAccuracy: number;
  userSatisfaction: number;
}

const ModelPerformanceAnalytics: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockData: PerformanceData[] = [
        { date: '2025-01-01', accuracy: 85.2, languageConsistency: 92.1, biblicalAccuracy: 88.7, userSatisfaction: 87.3 },
        { date: '2025-01-02', accuracy: 86.1, languageConsistency: 93.2, biblicalAccuracy: 89.1, userSatisfaction: 88.1 },
        { date: '2025-01-03', accuracy: 85.8, languageConsistency: 91.8, biblicalAccuracy: 88.9, userSatisfaction: 87.8 },
        { date: '2025-01-04', accuracy: 87.2, languageConsistency: 94.1, biblicalAccuracy: 90.2, userSatisfaction: 89.1 },
        { date: '2025-01-05', accuracy: 86.9, languageConsistency: 93.7, biblicalAccuracy: 89.8, userSatisfaction: 88.9 },
      ];
      
      setPerformanceData(mockData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: performanceData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Overall Accuracy',
        data: performanceData.map(d => d.accuracy),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Language Consistency',
        data: performanceData.map(d => d.languageConsistency),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Biblical Accuracy',
        data: performanceData.map(d => d.biblicalAccuracy),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: 'User Satisfaction',
        data: performanceData.map(d => d.userSatisfaction),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'AI Model Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) {
            return value + '%';
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Performance Analytics</h3>
        <div className="flex space-x-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        {[
          { label: 'Avg Accuracy', value: '86.4%', color: 'blue' },
          { label: 'Avg Language Consistency', value: '93.0%', color: 'green' },
          { label: 'Avg Biblical Accuracy', value: '89.3%', color: 'purple' },
          { label: 'Avg User Satisfaction', value: '88.2%', color: 'orange' }
        ].map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelPerformanceAnalytics;
