import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, LayoutDashboard, User } from 'lucide-react';

const API_BASE = '/api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('worker@gig.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(res.data.token);
    } catch (err) { alert('Login failed'); }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE}/auth/register`, { 
        email, password, name: 'John Doe', workerId: 'SW-9921' 
      });
      alert('Registered! Now login.');
    } catch (err) { alert('Registration failed'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-gig-orange mb-6 flex items-center gap-2">
          <Shield size={32}/> GigGuard
        </h1>
        <input className="w-full border p-3 rounded mb-4" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-3 rounded mb-6" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-gig-orange text-white py-3 rounded-lg font-bold mb-3">Login</button>
        <button onClick={handleRegister} className="w-full text-gray-500 text-sm">Create New Account</button>
      </div>
    </div>
  );
};

const WorkerDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await axios.get(`${API_BASE}/claims/history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setClaims(res.data);
  };

  const fileClaim = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/claims/submit`, {
        userId: user.email,
        policyId: 'POL-WEATHER-001',
        gps: { lat: 12.9716, long: 77.5946 },
        orders: 0,
        ip: '192.168.1.1'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchHistory();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user.name}</h2>
          <p className="text-gray-500">ID: {user.workerId} | Zone: Bengaluru Central</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
          <Shield size={18}/> Active Protection
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gig-orange">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg">Weather Disruption</h3>
            <span className="bg-orange-100 text-gig-orange p-2 rounded"><AlertTriangle/></span>
          </div>
          <p className="text-sm text-gray-600 mb-4">Heavy Rainfall detected in your area. You are eligible for idle-time compensation.</p>
          <button 
            disabled={loading}
            onClick={fileClaim}
            className="w-full bg-gig-orange text-white py-2 rounded font-bold hover:bg-orange-600 transition"
          >
            {loading ? 'Analyzing...' : 'Request Payout'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <h3 className="font-bold text-lg mb-2">Coverage Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Weekly Premium</span><span className="font-bold">₹150</span></div>
            <div className="flex justify-between"><span>Max Payout</span><span className="font-bold">₹5,000</span></div>
            <div className="flex justify-between"><span>Status</span><span className="text-blue-500 font-bold italic">Auto-Renewal ON</span></div>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-xl mb-4">Recent Activity</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No claims filed yet</div>
        ) : claims.map(c => (
          <div key={c._id} className="p-4 border-b flex justify-between items-center hover:bg-gray-50">
            <div>
              <div className="font-bold text-gray-800">Parametric Payout</div>
              <div className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">₹{c.amount}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                c.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                c.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              }`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ claims: [], payouts: [] });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const [c, p] = await Promise.all([
        axios.get(`${API_BASE}/claims/history`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get(`${API_BASE}/payouts/logs`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setStats({ claims: c.data, payouts: p.data });
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">System Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-500 text-sm">Total Claims</div>
          <div className="text-2xl font-bold">{stats.claims.length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-500 text-sm">Suspicious Alerts</div>
          <div className="text-2xl font-bold text-red-500">{stats.claims.filter(c => c.fraudScore > 40).length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-gray-500 text-sm">Paid Out</div>
          <div className="text-2xl font-bold text-green-500">₹{stats.payouts.reduce((acc, curr) => acc + curr.amount, 0)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold text-lg mb-4">Fraud Monitoring Queue</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Worker ID</th>
              <th>Fraud Score</th>
              <th>Risk Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.claims.map(c => (
              <tr key={c._id} className="border-b">
                <td className="py-2">{c.userId}</td>
                <td>{c.fraudScore}</td>
                <td>
                  <span className={c.fraudScore > 50 ? 'text-red-500 font-bold' : 'text-gray-500'}>
                    {c.fraudScore > 50 ? 'HIGH' : 'LOW'}
                  </span>
                </td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Login setAuth={setToken} />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gray-900 text-white p-4 flex justify-between">
          <div className="flex gap-6 items-center">
            <Link to="/" className="font-bold text-gig-orange text-xl">GigGuard AI</Link>
            <Link to="/" className="flex items-center gap-1 hover:text-gig-orange"><LayoutDashboard size={16}/> Dashboard</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1 hover:text-gig-orange"><Shield size={16}/> Admin</Link>
            )}
          </div>
          <button onClick={() => { localStorage.clear(); setToken(null); }} className="text-sm bg-gray-800 px-3 py-1 rounded">Logout</button>
        </nav>
        <Routes>
          <Route path="/" element={<WorkerDashboard />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
