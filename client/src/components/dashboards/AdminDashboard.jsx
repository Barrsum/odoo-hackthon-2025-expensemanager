// client/src/components/dashboards/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, IndianRupee, Hourglass } from 'lucide-react';
import { StatCard } from './StatCard';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('authToken');
      const res = await axios.get('http://localhost:3001/api/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Users"
        value={stats.totalUsers || 0}
        icon={Users}
        description="All users in the system"
      />
      <StatCard
        title="Pending Approval Amount"
        value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.pendingAmount || 0)}
        icon={Hourglass}
        description="Total amount awaiting action"
      />
      <StatCard
        title="Approved This Month"
        value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.approvedThisMonth || 0)}
        icon={IndianRupee}
        description="Total amount approved in the current month"
      />
    </div>
  );
};