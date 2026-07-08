import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { getSummary, getCharts, getRecentActivity } from "../../services/dashboardService";
import "./Analytics.css";

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sumRes, charRes, actRes] = await Promise.all([
          getSummary(),
          getCharts(),
          getRecentActivity()
        ]);
        setSummary(sumRes.summary);
        
        const formattedTaskTrend = (charRes.charts?.taskTrend || []).map(t => {
          const d = new Date(t._id);
          return {
            name: `${d.getMonth()+1}/${d.getDate()}`,
            completed: t.totalTasks,
            planned: 0
          };
        });

        const formattedWorkload = (charRes.charts?.workload || []).map(w => ({
          name: w.project[0]?.name || "Unknown",
          hours: w.hours || (w.reports * 40)
        }));

        setCharts({ taskTrend: formattedTaskTrend, workload: formattedWorkload });
        setActivities(actRes.reports || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const timeAgo = (dateString) => {
    if (!dateString) return "Unknown";
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000 / 60);
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };
  return (
    <DashboardLayout activeItem="analytics" title="Analytics & Statistics" subtitle="Insights into team performance and workload.">
      <div className="analytics-container">
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
              <span className="material-symbols-outlined">description</span>
            </div>
            <div className="stat-content">
              <h3>{summary?.totalReports || 0}</h3>
              <p>Reports Submitted</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}>
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div className="stat-content">
              <h3>{summary?.complianceRate || 0}%</h3>
              <p>Compliance Rate</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--color-error-container)', color: 'var(--color-on-error-container)' }}>
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="stat-content">
              <h3>{summary?.blockerReports || 0}</h3>
              <p>Open Blockers</p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Completed Tasks Trend</h3>
            </div>
            <div className="chart-body" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.taskTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-surface-container-highest)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="planned" name="Planned" stroke="var(--color-tertiary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Workload Distribution</h3>
            </div>
            <div className="chart-body" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.workload || []} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-surface-container-highest)" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-soft)' }}
                    cursor={{fill: 'var(--color-surface-container-low)'}}
                  />
                  <Bar dataKey="hours" name="Hours Logged" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="activity-feed">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {loading ? (
              <p>Loading activities...</p>
            ) : activities.length === 0 ? (
              <p>No recent activities.</p>
            ) : (
              activities.map((act) => (
                <li key={act._id} className="activity-item">
                  <div className={`activity-icon ${act.blockers?.length > 0 ? 'warning' : ''}`}>
                    <span className="material-symbols-outlined">
                      {act.blockers?.length > 0 ? 'warning' : 'check_circle'}
                    </span>
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{act.user?.name || "Someone"}</strong>{" "}
                      {act.status === 'SUBMITTED' ? 'submitted' : 'drafted'} a report for {act.project?.name || "a project"}.
                    </p>
                    <span className="activity-time">{timeAgo(act.createdAt)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
