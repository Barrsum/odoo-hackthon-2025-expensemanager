// client/src/components/dashboards/EmployeeDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { IndianRupee, Hourglass, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';

export const EmployeeDashboard = () => {
  const [stats, setStats] = useState({});
  // ... (useEffect to fetch stats is the same as AdminDashboard) ...
  useEffect(() => { const fetchStats = async () => { const token = localStorage.getItem('authToken'); const res = await axios.get('https://odoo-hackthon-2025-expensemanager-app.onrender.com/api/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }); setStats(res.data); }; fetchStats(); }, []);
  
  const approvalRate = stats.totalSubmitted > 0 ? (stats.totalApproved / stats.totalSubmitted) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard title="My Total Submitted" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalSubmitted || 0)} icon={IndianRupee} />
      <StatCard title="My Total Approved" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.totalApproved || 0)} icon={CheckCircle} />
      <StatCard title="My Pending Expenses" value={stats.pendingCount || 0} icon={Hourglass} description={`${approvalRate.toFixed(1)}% approval rate`} />
    </div>
  );
};