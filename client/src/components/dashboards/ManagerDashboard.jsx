// client/src/components/dashboards/ManagerDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, IndianRupee, Hourglass } from 'lucide-react';
import { StatCard } from './StatCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

export const ManagerDashboard = () => {
  const [stats, setStats] = useState({});
  // ... (useEffect to fetch stats is the same as AdminDashboard) ...
  useEffect(() => { const fetchStats = async () => { const token = localStorage.getItem('authToken'); const res = await axios.get('http://localhost:3001/api/dashboard-stats', { headers: { Authorization: `Bearer ${token}` } }); setStats(res.data); }; fetchStats(); }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="My Team Size" value={stats.teamSize || 0} icon={Users} />
        <StatCard title="Pending Team Approvals" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.pendingTeamAmount || 0)} icon={Hourglass} />
        <StatCard title="Team Approved (Month)" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.approvedTeamThisMonth || 0)} icon={IndianRupee} />
      </div>
      <Card className="animate-fade-in [animation-delay:150ms]">
        <CardHeader><CardTitle>Team Expenses by Category</CardTitle></CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.expensesByCategory || []} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={(props) => props.name}>
                  {(stats.expensesByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};