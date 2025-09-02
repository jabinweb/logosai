'use client';

import React from 'react';
import AITrainingDashboard from '@/components/admin/AITrainingDashboard';

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="py-8">
        <AITrainingDashboard />
      </div>
    </div>
  );
}
