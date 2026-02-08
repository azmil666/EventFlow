'use client';

import React from 'react';
import DashboardWidget from './shared/DashboardWidget';
import './AdminDashboard.css';

/**
 * Admin Dashboard Component
 * @param {import('./types').DashboardProps} props
 */
export default function AdminDashboard({ userId, role }) {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="welcome-text">Welcome, Admin {userId}</p>
      </div>
      
      <div className="dashboard-grid">
        <DashboardWidget title="User Management">
          <div className="widget-stats">
            <p><strong>Total Users:</strong> <span>[Placeholder]</span></p>
            <p><strong>Active Sessions:</strong> <span>[Placeholder]</span></p>
            <p><strong>New Registrations:</strong> <span>[Placeholder]</span></p>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Event Statistics">
          <div className="widget-stats">
            <p><strong>Total Events:</strong> <span>[Placeholder]</span></p>
            <p><strong>Upcoming Events:</strong> <span>[Placeholder]</span></p>
            <p><strong>Completed Events:</strong> <span>[Placeholder]</span></p>
          </div>
        </DashboardWidget>

        <DashboardWidget title="System Status">
          <div className="widget-stats">
            <p><strong>Server Status:</strong> <span className="status-ok">Online</span></p>
            <p><strong>Database:</strong> <span className="status-ok">Connected</span></p>
            <p><strong>Last Backup:</strong> <span>[Placeholder]</span></p>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Recent Activity">
          <div className="activity-list">
            <p>• User registration event [Placeholder]</p>
            <p>• Event created [Placeholder]</p>
            <p>• System update [Placeholder]</p>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}