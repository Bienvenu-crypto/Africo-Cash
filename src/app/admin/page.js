"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { 
  Search, Bell, Settings, User, Download, Home, Users, Settings as ConfigIcon, 
  PieChart as PieIcon, BarChart2, TrendingUp, Map, HelpCircle, Calendar as CalendarIcon
} from "lucide-react";

const CONFIG_LABELS = {
  withdrawal_rate: "Taux de retrait agent (%)",
  transfer_fee_rate: "Frais d'envoi de compte à compte (%)",
  rate_usd_to_cdf: "Taux de change USD → CDF",
  rate_cdf_to_usd: "Taux de change CDF → USD",
  mobile_deposit_fee_rate: "Frais de dépôt depuis Mobile Money (%)",
  mobile_withdrawal_fee_rate: "Frais de retrait vers Mobile Money (%)",
  bank_atm_withdrawal_fee_rate: "Frais de retrait GAB / Guichet Banque (%)",
  bank_deposit_fee_rate: "Frais de dépôt depuis Banque (%)",
  bank_transfer_fee_rate: "Frais d'envoi vers Banque (%)",
  regideso_fee_rate: "Frais de paiement REGIDESO (%)",
  electricity_fee_rate: "Frais de paiement Électricité (%)",
  telecom_tv_fee_rate: "Frais de paiement Télécom & TV (%)",
  merchant_fee_rate: "Frais marchands (%)",
  payment_fee_rate: "Frais de paiement standard (%)",
};

const PIE_COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#c084fc', '#f87171'];

export default function AdminDashboard() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const savedToken = sessionStorage.getItem("adminToken");
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        sessionStorage.setItem("adminToken", data.token);
      } else {
        setLoginError(data.error || "Mot de passe incorrect");
      }
    } catch (err) {
      setLoginError("Erreur de connexion");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("adminToken");
  };

  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#141b2d] px-4 font-sans">
        <div className="w-full max-w-md rounded-xl bg-[#1f2a40] p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">ADMINIS Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#141b2d] px-4 py-2 font-bold text-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingLogin ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#141b2d] text-gray-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1f2a40] h-full flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold tracking-widest text-white">ADMINIS</h1>
          <button className="text-gray-400 hover:text-white">☰</button>
        </div>
        
        <div className="flex flex-col items-center py-6">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-500 mb-3">
            {/* Minimal SVG Avatar for placeholder */}
            <div className="h-full w-full bg-gray-600 flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Administrateur</h2>
          <p className="text-sm text-green-400">Africo Cash Admin</p>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-2 text-sm font-medium">
          <SidebarItem icon={<Home size={18} />} text="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Users size={18} />} text="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<ConfigIcon size={18} />} text="Configuration" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </nav>
        
        <div className="p-4">
          <button onClick={handleLogout} className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition py-2 rounded-lg font-bold">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center bg-[#1f2a40] rounded-md px-3 py-1.5 w-64">
            <input type="text" placeholder="Search" className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400" />
            <Search size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <button className="hover:text-white transition"><User size={20} /></button>
            <button className="hover:text-white transition"><Bell size={20} /></button>
            <button className="hover:text-white transition"><Settings size={20} /></button>
          </div>
        </header>

        {/* DASHBOARD VIEWS */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "dashboard" && <TransactionsDashboardView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "config" && <ConfigView />}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #141b2d; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a5568; }
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #4ade80; --rdp-background-color: #1f2a40; color: #fff; margin: 0; }
        .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: #141b2d !important; font-weight: bold; }
        .rdp-day:hover:not(.rdp-day_selected) { background-color: #2d3748; }
      `}} />
    </div>
  );
}

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center px-4 py-3 cursor-pointer transition-colors rounded-lg ${active ? 'text-indigo-400 bg-[#2d3748]/60 border-l-4 border-indigo-400' : 'text-gray-300 hover:text-white hover:bg-[#2d3748]/30'}`}>
      <span className="mr-4">{icon}</span>
      <span className="font-semibold">{text}</span>
    </div>
  );
}

function TransactionsDashboardView() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchTransactions = async (range) => {
    setLoading(true);
    try {
      let url = "/api/admin/transactions";
      if (range?.from) {
        const fromStr = format(range.from, "yyyy-MM-dd");
        url += `?from=${fromStr}`;
        if (range.to) {
          const toStr = format(range.to, "yyyy-MM-dd");
          url += `&to=${toStr}`;
        }
      }
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(dateRange);
  }, [dateRange]);

  // Aggregate Data for Charts
  const totalVolume = transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalFees = transactions.reduce((acc, tx) => acc + tx.fee, 0);

  // Line Chart Data: Group by date and type
  const lineDataObj = {};
  transactions.forEach(tx => {
    const dateStr = format(parseISO(tx.created_at.replace(" ", "T")), "MMM dd");
    if (!lineDataObj[dateStr]) lineDataObj[dateStr] = { name: dateStr, Depot: 0, Retrait: 0, Paiement: 0 };
    
    if (tx.type.toLowerCase().includes('depot')) lineDataObj[dateStr].Depot += Math.abs(tx.amount);
    else if (tx.type.toLowerCase().includes('retrait')) lineDataObj[dateStr].Retrait += Math.abs(tx.amount);
    else lineDataObj[dateStr].Paiement += Math.abs(tx.amount);
  });
  const lineData = Object.values(lineDataObj).reverse();

  // Pie Chart Data: Group by transaction type
  const pieDataObj = {};
  transactions.forEach(tx => {
    const type = tx.type;
    if (!pieDataObj[type]) pieDataObj[type] = 0;
    pieDataObj[type] += Math.abs(tx.amount);
  });
  const pieData = Object.keys(pieDataObj).map(key => ({ name: key, value: pieDataObj[key] }));

  // Bar Chart Data: Simple count by day
  const barDataObj = {};
  transactions.forEach(tx => {
    const dateStr = format(parseISO(tx.created_at.replace(" ", "T")), "MMM dd");
    if (!barDataObj[dateStr]) barDataObj[dateStr] = { name: dateStr, count: 0 };
    barDataObj[dateStr].count += 1;
  });
  const barData = Object.values(barDataObj).reverse();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">DASHBOARD</h2>
          <p className="text-sm text-indigo-400 font-semibold">Bienvenue sur votre tableau de bord interactif</p>
        </div>
        <div className="flex space-x-3 relative">
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-[#1f2a40] hover:bg-[#2d3748] text-white text-sm font-bold py-2 px-4 rounded border border-gray-700 transition">
            <CalendarIcon size={16} className="mr-2" />
            {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Filtrer"} - {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : ""}
          </button>
          
          {showCalendar && (
            <div className="absolute top-12 right-0 z-50 bg-[#1f2a40] rounded-xl border border-gray-700 shadow-2xl p-4">
              <DayPicker mode="range" selected={dateRange} onSelect={(r) => { if(r) setDateRange(r) }} locale={fr} />
              <button onClick={() => setShowCalendar(false)} className="w-full mt-2 bg-indigo-600 py-1 rounded text-sm text-white font-bold">Fermer</button>
            </div>
          )}

          <button className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded transition">
            <Download size={16} className="mr-2" />
            RAPPORTS
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Transactions" value={transactions.length} progress={100} color="#38bdf8" />
        <StatCard title="Volume Obtenu ($)" value={totalVolume.toFixed(2)} progress={75} color="#4ade80" />
        <StatCard title="Frais Générés ($)" value={totalFees.toFixed(2)} progress={60} color="#fbbf24" />
        <StatCard title="Comptes Utilisés" value={new Set(transactions.map(t => t.client_account)).size} progress={80} color="#c084fc" />
      </div>

      {/* MIDDLE ROW (LINE CHART & TRANSACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* LINE CHART */}
        <div className="bg-[#1f2a40] p-6 rounded-lg lg:col-span-2 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Volume Généré (Dans le temps)</h3>
              <p className="text-2xl font-bold text-green-400">${totalVolume.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', right: 0 }} />
                  <Line type="monotone" dataKey="Depot" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Retrait" stroke="#c084fc" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Paiement" stroke="#4ade80" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Pas de données pour ce graphique</div>
            )}
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-[#1f2a40] rounded-lg shadow-lg overflow-hidden flex flex-col h-[340px]">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white">Transactions Récentes</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <p className="text-gray-400 p-4">Chargement...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-400 p-4">Aucune transaction trouvée.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-[#2d3748] transition">
                  <div>
                    <p className="text-sm font-bold text-indigo-400">{tx.client_account}</p>
                    <p className="text-xs text-gray-400">{tx.type}</p>
                  </div>
                  <div className="text-xs text-gray-400">{format(parseISO(tx.created_at.replace(" ", "T")), "MMM dd, yyyy")}</div>
                  <div className={`${tx.amount > 0 ? "bg-green-500" : "bg-red-500"} text-white text-xs font-bold px-2 py-1 rounded`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM ROW (PIE, BAR, GEO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PIE CHART */}
        <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-sm font-semibold text-white w-full text-left mb-2">Répartition (Volume)</h3>
          <div className="h-48 w-full relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Vide</div>
            )}
          </div>
          <p className="text-green-400 text-lg font-bold mt-2">${totalVolume.toFixed(2)} Volume total</p>
        </div>

        {/* BAR CHART */}
        <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Quantité de Transactions / Jour</h3>
          <div className="h-56 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: '#2d3748' }} contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748' }} />
                  <Bar dataKey="count" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-500">Vide</div>
            )}
          </div>
        </div>

        {/* GEOGRAPHY PLACEHOLDER */}
        <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-4">Trafic Géographique RDC</h3>
          <div className="flex-1 flex items-center justify-center opacity-70 relative">
             <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-600">
                <path d="M150 100 Q 200 50 300 80 T 450 150 T 600 120 T 750 180" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="300" cy="180" r="10" fill="#4ade80" />
                <circle cx="550" cy="100" r="8" fill="#38bdf8" />
                <text x="300" y="210" fill="#4ade80" textAnchor="middle" fontSize="16" className="font-bold">Kinshasa</text>
                <text x="550" y="130" fill="#38bdf8" textAnchor="middle" fontSize="16" className="font-bold">Goma</text>
             </svg>
          </div>
        </div>

      </div>
    </>
  );
}

function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Utilisateurs Enregistrés</h2>
      <div className="rounded-xl bg-[#1f2a40] p-6 shadow-lg border border-gray-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#141b2d] text-gray-400">
              <tr>
                <th className="p-3 font-medium rounded-tl-lg">Compte</th>
                <th className="p-3 font-medium">Nom Complet</th>
                <th className="p-3 font-medium">Téléphone</th>
                <th className="p-3 font-medium">Solde USD</th>
                <th className="p-3 font-medium rounded-tr-lg">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">Chargement...</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-[#2d3748] transition">
                    <td className="p-3 font-bold text-indigo-400">{u.account_number}</td>
                    <td className="p-3 text-white">{u.prenom} {u.nom}</td>
                    <td className="p-3 text-gray-400">{u.telephone}</td>
                    <td className="p-3 font-medium text-green-400">{u.balance_usd} $</td>
                    <td className="p-3 text-gray-500">{format(new Date(u.created_at.replace(" ", "T")), "dd/MM/yyyy")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConfigView() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {};
    for (const [k, v] of Object.entries(config)) {
      payload[k] = Number(v);
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotice(data.message);
      setTimeout(() => setNotice(""), 5000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(key, val) {
    setConfig((prev) => ({ ...prev, [key]: val }));
  }

  if (loading) return <div className="text-gray-400 p-6">Chargement de la configuration...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Configuration des Tarifs</h2>
      <div className="rounded-xl bg-[#1f2a40] p-6 shadow-lg border border-gray-800">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.entries(config).map(([key, val]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-gray-400">{CONFIG_LABELS[key] || key}</label>
                <input
                  type="number"
                  step="0.0001"
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-[#141b2d] text-white px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6">
            {notice && <div className="mb-4 rounded-md bg-green-500/10 border border-green-500/20 p-4 text-green-400">{notice}</div>}
            {error && <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 p-4 text-red-400">{error}</div>}
            
            <button 
              type="submit" 
              disabled={saving} 
              className="rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ title, value, progress, color }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-[#1f2a40] p-6 rounded-lg shadow-lg flex justify-between items-center border border-gray-800">
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium" style={{ color }}>{title}</p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="relative h-12 w-12 flex items-center justify-center">
          <svg className="h-12 w-12 transform -rotate-90">
            <circle cx="24" cy="24" r={radius} stroke="#2d3748" strokeWidth="4" fill="none" />
            <circle cx="24" cy="24" r={radius} stroke={color} strokeWidth="4" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
