import React from 'react'
import { SimpleAnalyticsDashboard } from '@/components/analytics/simple-analytics-dashboard'

export default function AnalyticsTestPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SimpleAnalyticsDashboard userRole="ADMIN" />
    </div>
  )
}
