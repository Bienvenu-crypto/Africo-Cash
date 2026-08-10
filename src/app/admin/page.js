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
  PieChart as PieIcon, BarChart2, TrendingUp, Map, HelpCircle, Calendar as CalendarIcon,
  UserCheck, List
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

function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    return (
      (tx.client_account || "").toLowerCase().includes(q) ||
      (tx.type || "").toLowerCase().includes(q) ||
      (tx.client_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Historique des Transactions</h2>
        <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-full px-4 py-1 text-sm font-semibold">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center bg-[#1f2a40] rounded-lg px-4 py-2 mb-5 w-full max-w-sm">
        <Search size={16} className="text-gray-400 mr-2" />
        <input autoComplete="new-password"
          type="text"
          placeholder="Rechercher (compte, type, référence)..."
          className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl bg-[#1f2a40] p-6 shadow-lg border border-gray-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#141b2d] text-gray-400">
              <tr>
                <th className="p-3 font-medium rounded-tl-lg">Compte</th>
                <th className="p-3 font-medium">Nom du Client</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Montant</th>
                <th className="p-3 font-medium">Frais</th>
                <th className="p-3 font-medium rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">Aucune transaction trouvée.</td></tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#2d3748] transition">
                    <td className="p-3 font-bold text-indigo-400">{tx.client_account}</td>
                    <td className="p-3 text-white">{tx.client_name ? tx.client_name.trim() : <span className="text-gray-500 italic">Inconnu</span>}</td>
                    <td className="p-3 text-white">{tx.type}</td>
                    <td className="p-3">
                      <span className={`${tx.amount > 0 ? "text-green-400" : "text-red-400"} font-bold`}>
                        {tx.currency === 'USD' ? `$${tx.amount.toFixed(2)}` : `${tx.amount.toLocaleString('fr-FR')} FC`}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-medium">
                      {tx.currency === 'USD' ? `$${tx.fee.toFixed(2)}` : `${tx.fee.toLocaleString('fr-FR')} FC`}
                    </td>
                    <td className="p-3 text-gray-500">{format(parseISO(tx.created_at.replace(" ", "T")), "dd/MM/yyyy HH:mm")}</td>
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
    setPassword("");
    setLoginError("");
    sessionStorage.removeItem("adminToken");
  };

  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#141b2d] px-4 font-sans">
        <div className="w-full max-w-md rounded-xl bg-[#1f2a40] p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">Connexion Administrateur</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Mot de passe</label>
              <input autoComplete="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#141b2d] px-4 py-2 font-bold text-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=""
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
          <h1 className="text-xl font-bold tracking-widest text-white">PANNEAU ADMIN</h1>

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
          <SidebarItem icon={<Home size={18} />} text="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<List size={18} />} text="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <SidebarItem icon={<Users size={18} />} text="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarItem icon={<UserCheck size={18} />} text="Agents Africo" active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} />
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


        {/* DASHBOARD VIEWS */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "dashboard" && <TransactionsDashboardView />}
          {activeTab === "transactions" && <TransactionsView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "agents" && <AgentsView />}
          {activeTab === "config" && <ConfigView />}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
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

  // Aggregate Data for Charts — split by currency
  const totalVolumeUSD = transactions.filter(tx => tx.currency === 'USD').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalVolumeCDF = transactions.filter(tx => tx.currency === 'CDF').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalFeesUSD = transactions.filter(tx => tx.currency === 'USD').reduce((acc, tx) => acc + tx.fee, 0);
  const totalFeesCDF = transactions.filter(tx => tx.currency === 'CDF').reduce((acc, tx) => acc + tx.fee, 0);
  const totalFees = { usd: totalFeesUSD, cdf: totalFeesCDF };

  // Line Chart Data: Group by date — USD and CDF volumes separately
  const lineDataObj = {};
  transactions.forEach(tx => {
    const dateStr = format(parseISO(tx.created_at.replace(" ", "T")), "MMM dd");
    if (!lineDataObj[dateStr]) lineDataObj[dateStr] = { name: dateStr, USD: 0, CDF: 0 };
    if (tx.currency === 'USD') lineDataObj[dateStr].USD += Math.abs(tx.amount);
    else if (tx.currency === 'CDF') lineDataObj[dateStr].CDF += Math.abs(tx.amount);
  });
  const lineData = Object.values(lineDataObj).reverse();

  // Pie Chart Data: Group by currency
  const pieData = [
    { name: 'USD', value: totalVolumeUSD },
    { name: 'CDF (÷1000)', value: totalVolumeCDF / 1000 },
  ].filter(d => d.value > 0);

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
          <h2 className="text-3xl font-bold text-white mb-1">TABLEAU DE BORD</h2>
          <p className="text-sm text-indigo-400 font-semibold">Bienvenue sur votre tableau de bord interactif</p>
        </div>
        <div className="flex space-x-3 relative">
          <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-[#1f2a40] hover:bg-[#2d3748] text-white text-sm font-bold py-2 px-4 rounded border border-gray-700 transition">
            <CalendarIcon size={16} className="mr-2" />
            {dateRange.from ? format(dateRange.from, "dd/MM/yyyy") : "Filtrer"} - {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : ""}
          </button>

          {showCalendar && (
            <div className="absolute top-12 right-0 z-50 bg-[#1f2a40] rounded-xl border border-gray-700 shadow-2xl p-4">
              <DayPicker mode="range" selected={dateRange} onSelect={(r) => { if (r) setDateRange(r) }} locale={fr} />
              <button onClick={() => setShowCalendar(false)} className="w-full mt-2 bg-indigo-600 py-1 rounded text-sm text-white font-bold">Fermer</button>
            </div>
          )}


        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Transactions" value={transactions.length} progress={100} color="#38bdf8" />
        <StatCard title="Volume USD ($)" value={`$${totalVolumeUSD.toFixed(2)}`} progress={75} color="#4ade80" />
        <StatCard title="Volume CDF (FC)" value={`${totalVolumeCDF.toLocaleString('fr-FR')} FC`} progress={65} color="#f59e0b" />
        <StatCard title="Frais Générés" value={<span className="text-sm"><span className="text-yellow-300">${totalFees.usd.toFixed(2)}</span> <span className="text-gray-400">|</span> <span className="text-amber-400">{totalFees.cdf.toLocaleString('fr-FR')} FC</span></span>} progress={60} color="#fbbf24" />
        <StatCard title="Comptes Utilisés" value={new Set(transactions.map(t => t.client_account)).size} progress={80} color="#c084fc" />
      </div>

      {/* MIDDLE ROW (LINE CHART & TRANSACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* LINE CHART — Volume USD vs CDF */}
        <div className="bg-[#1f2a40] p-6 rounded-lg lg:col-span-2 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Volume Généré (USD vs CDF dans le temps)</h3>
              <div className="flex gap-4 mt-1">
                <p className="text-lg font-bold text-green-400">${totalVolumeUSD.toFixed(2)} USD</p>
                <p className="text-lg font-bold text-amber-400">{totalVolumeCDF.toLocaleString('fr-FR')} FC</p>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748' }} formatter={(val, name) => [name === 'USD' ? `$${val.toFixed(2)}` : `${val.toFixed(0)} FC`, name]} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', right: 0 }} />
                  <Line type="monotone" dataKey="USD" stroke="#4ade80" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="CDF" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
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
                    {tx.currency === 'USD' ? `$${Math.abs(tx.amount).toFixed(2)}` : `${Math.abs(tx.amount).toLocaleString('fr-FR')} FC`}
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
          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="text-green-400 text-base font-bold">${totalVolumeUSD.toFixed(2)} USD</p>
            <p className="text-amber-400 text-base font-bold">{totalVolumeCDF.toLocaleString('fr-FR')} FC</p>
          </div>
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const fullName = `${u.prenom || ""} ${u.postnom || ""} ${u.nom || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (u.account_number || "").toLowerCase().includes(q) ||
      (u.telephone || "").includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Utilisateurs Enregistrés</h2>
        <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-full px-4 py-1 text-sm font-semibold">
          {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-center bg-[#1f2a40] rounded-lg px-4 py-2 mb-5 w-full max-w-sm">
        <Search size={16} className="text-gray-400 mr-2" />
        <input autoComplete="new-password"
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="rounded-xl bg-[#1f2a40] p-6 shadow-lg border border-gray-800">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#141b2d] text-gray-400">
              <tr>
                <th className="p-3 font-medium rounded-tl-lg">Compte</th>
                <th className="p-3 font-medium">Nom Complet</th>
                <th className="p-3 font-medium">Téléphone</th>
                <th className="p-3 font-medium">Profession</th>
                <th className="p-3 font-medium text-green-400">Solde USD 🇺🇸</th>
                <th className="p-3 font-medium text-amber-400">Solde CDF 🇨🇩</th>
                <th className="p-3 font-medium">Date d'inscription</th>
                <th className="p-3 font-medium rounded-tr-lg text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-500">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center text-gray-500">Aucun utilisateur trouvé.</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u.id} className="hover:bg-[#2d3748] transition">
                    <td className="p-3 font-bold text-indigo-400">{u.account_number}</td>
                    <td className="p-3 text-white">{u.prenom} {u.postnom || ""} {u.nom}</td>
                    <td className="p-3 text-gray-400">{u.telephone}</td>
                    <td className="p-3 text-gray-400">{u.profession || "N/A"}</td>
                    <td className="p-3 font-medium text-green-400">${Number(u.balance_usd).toFixed(2)}</td>
                    <td className="p-3 font-medium text-amber-400">{Number(u.balance_cdf).toLocaleString('fr-FR')} FC</td>
                    <td className="p-3 text-gray-500">{format(new Date(u.created_at.replace(" ", "T")), "dd/MM/yyyy")}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="rounded bg-indigo-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-indigo-700"
                      >
                        Détails KYC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-800 bg-[#1f2a40] p-6 shadow-2xl text-gray-200">
            <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-3">
              <h3 className="text-xl font-bold text-white">Détails de l'utilisateur : {selectedUser.account_number}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block">Prénom</label>
                  <p className="text-sm font-semibold text-white">{selectedUser.prenom}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Nom & Postnom</label>
                  <p className="text-sm font-semibold text-white">{selectedUser.nom} {selectedUser.postnom || ""}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block">Téléphone</label>
                  <p className="text-sm font-semibold text-white">{selectedUser.telephone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Profession</label>
                  <p className="text-sm font-semibold text-white">{selectedUser.profession || "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <h4 className="text-sm font-bold text-indigo-400 mb-2">Adresse & Résidence</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block">Province / Ville</label>
                    <p className="text-sm font-semibold text-white">{selectedUser.province} / {selectedUser.ville}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Commune / Quartier</label>
                    <p className="text-sm font-semibold text-white">{selectedUser.commune || "N/A"} / {selectedUser.quartier || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Avenue & N°</label>
                    <p className="text-sm font-semibold text-white">Av. {selectedUser.avenue || "N/A"}, N° {selectedUser.numero_residence || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Statut du compte</label>
                    <p className={`text-sm font-bold ${selectedUser.status === 'Actif' ? 'text-green-400' : 'text-red-400'}`}>{selectedUser.status}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <h4 className="text-sm font-bold text-indigo-400 mb-2">Pièce d'identité</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block">Type de pièce</label>
                    <p className="text-sm font-semibold text-white">{selectedUser.piece_type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Numéro de pièce</label>
                    <p className="text-sm font-semibold text-white">{selectedUser.piece_numero}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <h4 className="text-sm font-bold text-indigo-400 mb-2">Soldes du Compte</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block">Solde USD</label>
                    <p className="text-sm font-semibold text-green-400">${Number(selectedUser.balance_usd).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block">Solde CDF</label>
                    <p className="text-sm font-semibold text-amber-400">{Number(selectedUser.balance_cdf).toLocaleString('fr-FR')} FC</p>
                  </div>
                </div>
              </div>

              {selectedUser.agent_inscripteur && (
                <div className="border-t border-gray-700 pt-3">
                  <label className="text-xs text-gray-400 block">Inscrit par l'agent</label>
                  <p className="text-sm font-semibold text-white">{selectedUser.agent_inscripteur}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-gray-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentsView() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/agents", { headers: { "x-admin-token": "africo-admin-2024" } })
      .then((r) => r.json())
      .then((d) => { setAgents(d.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    const fullName = `${a.nom || ""} ${a.postnom || ""} ${a.prenom || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (a.telephone || "").includes(q) ||
      (a.agent_code || "").toLowerCase().includes(q) ||
      (a.ville || "").toLowerCase().includes(q) ||
      (a.boutique_nom || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Agents Africo</h2>
        <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-full px-4 py-1 text-sm font-semibold">
          {agents.length} agent{agents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center bg-[#1f2a40] rounded-lg px-4 py-2 mb-5 w-full max-w-sm">
        <Search size={16} className="text-gray-400 mr-2" />
        <input autoComplete="new-password"
          type="text"
          placeholder="Rechercher un agent…"
          className="bg-transparent text-sm w-full outline-none text-white placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1f2a40] text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Code Agent</th>
                <th className="px-4 py-3">Nom complet</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Boutique</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Indice USD</th>
                <th className="px-4 py-3">Indice CDF</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Inscription</th>
                <th className="px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-500">Aucun agent trouvé.</td></tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="bg-[#141b2d] hover:bg-[#1f2a40] transition">
                    <td className="px-4 py-3 font-mono text-indigo-300 text-xs">{a.agent_code}</td>
                    <td className="px-4 py-3 font-semibold text-white">{[a.nom, a.postnom, a.prenom].filter(Boolean).join(" ")}</td>
                    <td className="px-4 py-3 text-gray-300">{a.telephone}</td>
                    <td className="px-4 py-3 text-gray-300">{a.boutique_nom || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">{a.ville || "—"}</td>
                    <td className="px-4 py-3 text-green-400 font-mono">{Number(a.index_cantonnement_usd || 0).toFixed(2)} $</td>
                    <td className="px-4 py-3 text-yellow-400 font-mono">{Number(a.index_cantonnement_cdf || 0).toLocaleString("fr-CD")} FC</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.status === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedAgent(a)} className="text-indigo-400 hover:text-indigo-200 text-xs font-bold border border-indigo-500/40 rounded-md px-2 py-1 hover:bg-indigo-500/10 transition">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* AGENT DETAILS MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAgent(null)}>
          <div className="bg-[#141b2d] border border-gray-700 rounded-2xl p-6 max-w-xl w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
                  <UserCheck size={24} className="text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{[selectedAgent.nom, selectedAgent.postnom, selectedAgent.prenom].filter(Boolean).join(" ")}</h3>
                  <span className="text-xs font-mono text-indigo-400">{selectedAgent.agent_code}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Nom", selectedAgent.nom],
                ["Post-nom", selectedAgent.postnom],
                ["Prénom", selectedAgent.prenom],
                ["Téléphone", selectedAgent.telephone],
                ["Province", selectedAgent.province],
                ["Ville", selectedAgent.ville],
                ["Commune", selectedAgent.commune],
                ["Quartier", selectedAgent.quartier],
                ["Avenue", selectedAgent.avenue],
                ["N° Boutique", selectedAgent.numero_boutique],
                ["Boutique", selectedAgent.boutique_nom],
                ["Pièce d'identité", selectedAgent.piece_type],
                ["N° pièce", selectedAgent.piece_numero],
                ["Banque partenaire", selectedAgent.banque_partenaire],
                ["GPS Latitude", selectedAgent.gps_lat],
                ["GPS Longitude", selectedAgent.gps_lng],
                ["Indice cantonnement USD", selectedAgent.index_cantonnement_usd != null ? `${Number(selectedAgent.index_cantonnement_usd).toFixed(2)} $` : "—"],
                ["Indice cantonnement CDF", selectedAgent.index_cantonnement_cdf != null ? `${Number(selectedAgent.index_cantonnement_cdf).toLocaleString("fr-CD")} FC` : "—"],
                ["Statut", selectedAgent.status],
                ["Date d'inscription", selectedAgent.created_at ? new Date(selectedAgent.created_at).toLocaleDateString("fr-FR") : "—"],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#1f2a40] rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-white font-semibold break-words">{val != null && val !== "" ? String(val) : "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
                <input autoComplete="new-password"
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
