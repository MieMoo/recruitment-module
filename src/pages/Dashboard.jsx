import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    scheduled: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
    hiredToday: 0,
  });
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  const fetchStats = async () => {
    const { data, error } = await supabase.from('applicants').select('*');
    if (error) return console.error(error);

    const today = new Date().toISOString().split('T')[0];
    const total = data.length;
    const applied = data.filter((a) => a.status === 'Applied').length;
    const scheduled = data.filter((a) => a.status === 'Pending Interview').length;
    const offered = data.filter((a) => a.status === 'Offer Sent').length;
    const hired = data.filter((a) => a.status === 'Hired').length;
    const rejected = data.filter((a) => a.status === 'Rejected').length;
    const hiredToday = data.filter((a) => a.status === 'Hired' && a.created_at?.startsWith(today)).length;

    setStats({ total, applied, scheduled, offered, hired, rejected, hiredToday });

    const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setRecent(sorted.slice(0, 5));
  };

  const fetchUpcomingInterviews = async () => {
    const { data, error } = await supabase
      .from('interviews')
      .select('*, applicants(first_name, last_name, position, education, institution)')
      .order('date', { ascending: true })
      .limit(3);

    if (error) return console.error(error);
    setUpcoming(data);
  };

  const exportToCSV = () => {
    const headers = ['First Name,Last Name,Email,Position,Education,Institution,Status'];
    const rows = recent.map((r) =>
      `${r.first_name},${r.last_name},${r.email || ''},${r.position || ''},${r.education || ''},${r.institution || ''},${r.status}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'recent_applicants.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchStats();
    fetchUpcomingInterviews();
  }, []);

  const COLORS = ['#3b82f6', '#facc15', '#fcd34d', '#34d399', '#f87171'];
  const statusChartData = [
    { name: 'Applied', value: stats.applied },
    { name: 'Scheduled', value: stats.scheduled },
    { name: 'Offered', value: stats.offered },
    { name: 'Hired', value: stats.hired },
    { name: 'Rejected', value: stats.rejected },
  ];

  return (
    <div className="pt-20 px-6 bg-[#f8f8f8] dark:bg-[#1e1e1e] text-[#3f3f3f] dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#b69d73] tracking-tight">Recruitment Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card title="Total Applicants" value={stats.total} icon="📋" color="blue" linkTo="/applicants" />
        <Card title="Today’s Hires" value={stats.hiredToday} icon="🔥" color="green" linkTo="/onboarding" />
        <Card title="Interviews Scheduled" value={stats.scheduled} icon="📅" color="amber" linkTo="/interviews" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-[#b69d73] mb-4">Applicant Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
  <PieChart
    margin={{ top: 40, right: 40, bottom: 40, left: 40 }} // ✅ adds padding around chart
  >
    <Pie
      data={statusChartData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      dataKey="value"
      label={({ cx, cy, midAngle, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        let y = cy + radius * Math.sin(-midAngle * RADIAN);

        // ✅ push label downward if it's too high
        if (y < 20) y = 20;

        const entry = statusChartData[index];
        return (
          <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
          >
            {`${entry.name}: ${(percent * 100).toFixed(0)}%`}
          </text>
        );
      }}
    >
      {statusChartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend verticalAlign="bottom" align="center" iconType="circle" />
  </PieChart>
</ResponsiveContainer>

        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-[#b69d73] mb-4">Applicant Status Bar Chart</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {statusChartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold text-[#b69d73] mb-4">Upcoming Interviews</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No interviews scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((i) => (
              <li key={i.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm">
                <p className="font-semibold mb-1">📅 {i.date} at {i.time}</p>
                <p>🧑‍💼 {i.applicants?.first_name} {i.applicants?.last_name} — {i.applicants?.position}</p>
                <p>🎓 {i.applicants?.education} @ {i.applicants?.institution}</p>
                <p>📍 Interview Type: {i.type}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#b69d73]">Recent Applicants</h2>
          <button
            onClick={exportToCSV}
            className="px-3 py-1 text-sm bg-[#b69d73] text-white rounded hover:bg-[#a88c65]"
          >
            Export to CSV
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No recent applicants.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                <p className="text-lg font-semibold">{r.first_name} {r.last_name}</p>
                <p className="text-sm">Applied on {new Date(r.created_at).toLocaleDateString()}</p>
                <p>📧 <strong>Email:</strong> {r.email}</p>
                <p>📌 <strong>Position:</strong> {r.position}</p>
                <p>🎓 <strong>Education:</strong> {r.education} @ {r.institution}</p>
                <p>🧭 <strong>Source:</strong> {r.source}</p>
                <p>📝 <strong>Status:</strong> <span className={
                  r.status === 'Hired'
                    ? 'text-green-400'
                    : r.status === 'Rejected'
                    ? 'text-red-400'
                    : 'text-pink-300'
                }>{r.status}</span></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, color = 'blue', linkTo = '/', icon = '📌' }) {
  const bg = {
    green: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
    amber: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200',
  }[color] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white';

  return (
    <Link to={linkTo} className="block">
      <div className={`p-6 rounded-xl shadow cursor-pointer transition transform duration-300 hover:scale-105 hover:shadow-xl ${bg} h-full`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium tracking-wide">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-4xl font-extrabold mt-4">{value}</p>
      </div>
    </Link>
  );
}