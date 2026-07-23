"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Field, inputClass, PrimaryButton, Alert, SectionHeading } from "@/components/ui";

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
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-blue-900">Accès Administrateur</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: "#2563eb" }}
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingLogin ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-full bg-blue-900 text-white md:w-64 md:flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-400">Admin Panel</h1>
          <p className="text-sm text-blue-200">Africo Cash</p>
        </div>
        <nav className="mt-6 flex flex-col space-y-2 px-4">
          <SidebarBtn active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
            📊 Tableau de Bord
          </SidebarBtn>
          <SidebarBtn active={activeTab === "users"} onClick={() => setActiveTab("users")}>
            👥 Utilisateurs
          </SidebarBtn>
          <SidebarBtn active={activeTab === "config"} onClick={() => setActiveTab("config")}>
            ⚙️ Configuration
          </SidebarBtn>
        </nav>
        <div className="absolute bottom-0 w-full p-4 md:relative md:mt-auto">
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600/80 px-4 py-2 text-sm font-semibold transition hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {activeTab === "dashboard" && <TransactionsView />}
        {activeTab === "users" && <UsersView />}
        {activeTab === "config" && <ConfigView />}
      </main>
    </div>
  );
}

function SidebarBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-lg px-4 py-3 text-left font-medium transition-colors ${
        active ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
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

  const totalVolume = transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalFees = transactions.reduce((acc, tx) => acc + tx.fee, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900">Tableau de Bord</h2>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Transactions" value={transactions.length} />
        <StatCard title="Volume Total (USD/CDF)" value={totalVolume.toFixed(2)} />
        <StatCard title="Frais Générés" value={totalFees.toFixed(2)} />
      </div>

      {/* Filter */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtrer par date</h3>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="rounded-md bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
          >
            {showCalendar ? "Masquer Calendrier" : "Ouvrir Calendrier"}
          </button>
        </div>
        
        {showCalendar && (
          <div className="mb-6 flex justify-center border-b border-gray-100 pb-6">
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range) setDateRange(range);
              }}
              locale={fr}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Compte Client</th>
                <th className="p-3 font-medium">Montant</th>
                <th className="p-3 font-medium">Frais</th>
                <th className="p-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">Aucune transaction pour cette période.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{format(new Date(tx.created_at), "dd/MM/yyyy HH:mm")}</td>
                    <td className="p-3 font-medium text-blue-900">{tx.type}</td>
                    <td className="p-3 text-gray-600">{tx.client_account}</td>
                    <td className={`p-3 font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount} {tx.currency}
                    </td>
                    <td className="p-3 text-gray-600">{tx.fee}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tx.status === 'Reussi' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {tx.status}
                      </span>
                    </td>
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
      <h2 className="text-3xl font-bold text-blue-900">Utilisateurs Enregistrés</h2>
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 font-medium">Compte</th>
                <th className="p-3 font-medium">Nom Complet</th>
                <th className="p-3 font-medium">Téléphone</th>
                <th className="p-3 font-medium">Solde USD</th>
                <th className="p-3 font-medium">Date d'inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">Chargement...</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-blue-900">{u.account_number}</td>
                    <td className="p-3 text-gray-800">{u.prenom} {u.nom}</td>
                    <td className="p-3 text-gray-600">{u.telephone}</td>
                    <td className="p-3 font-medium text-green-600">{u.balance_usd} $</td>
                    <td className="p-3 text-gray-500">{format(new Date(u.created_at), "dd/MM/yyyy")}</td>
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

  if (loading) return <div>Chargement de la configuration...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-900">Configuration des Tarifs</h2>
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {Object.entries(config).map(([key, val]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{CONFIG_LABELS[key] || key}</label>
                <input
                  type="number"
                  step="0.0001"
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            {notice && <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700">{notice}</div>}
            {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">{error}</div>}
            
            <button 
              type="submit" 
              disabled={saving} 
              className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="mt-2 text-3xl font-bold text-blue-900">{value}</p>
    </div>
  );
}
