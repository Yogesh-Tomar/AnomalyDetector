import { useState, useEffect } from "react";
import { endpoints } from "../services/api"; // Make sure this import exists

export function Settings() {
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookHost, setWebhookHost] = useState("");
  const [webhookPort, setWebhookPort] = useState("");
  const [webhookUsername, setWebhookUsername] = useState("");
  const [webhookPassword, setWebhookPassword] = useState("");
  const [showWebhookPassword, setShowWebhookPassword] = useState(false);
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [syslogHost, setSyslogHost] = useState("");
  const [syslogPort, setSyslogPort] = useState("");
  const [autolockEnabled, setAutolockEnabled] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load settings on mount
  useEffect(() => {
    endpoints.getSettings()
      .then(res => {
        const data = res.data;
        setWebhookEnabled(data.webhook?.enabled ?? false);
        setWebhookHost(data.webhook?.host ?? "");
        setWebhookPort(data.webhook?.port?.toString() ?? "");
        setWebhookUsername(data.webhook?.username ?? "");
        setWebhookPassword(data.webhook?.password ?? "");
        setSyslogEnabled(data.syslog?.enabled ?? false);
        setSyslogHost(data.syslog?.host ?? "");
        setSyslogPort(data.syslog?.port?.toString() ?? "");
        setAutolockEnabled(data.autoLockUser ?? false);
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await endpoints.updateSettings({
        webhook: {
          enabled: webhookEnabled,
          host: webhookHost,
          port: Number(webhookPort),
          username: webhookUsername,
          password: webhookPassword,
        },
        syslog: {
          enabled: syslogEnabled,
          host: syslogHost,
          port: Number(syslogPort),
        },
        autolockUser: autolockEnabled,
      });
      setMsg("Settings saved!");
      setTimeout(() => setMsg(""), 1200);
    } catch {
      setError("Failed to save settings");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-3">
          <i className="fa-solid fa-gear text-indigo-500 text-2xl"></i>
          Settings
        </h2>
        <form className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8" onSubmit={handleSubmit}>
          {/* Webhook Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-link text-indigo-400 text-xl"></i>
              <h3 className="text-lg font-semibold text-slate-800">Webhook Settings</h3>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={webhookEnabled} onChange={e => setWebhookEnabled(e.target.checked)} />
              Enable Webhook
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Host</label>
                <input required className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" value={webhookHost} onChange={e => setWebhookHost(e.target.value)} disabled={!webhookEnabled} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Port</label>
                <input type="number" required className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" value={webhookPort} onChange={e => setWebhookPort(e.target.value)} disabled={!webhookEnabled} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Username</label>
                <input className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                value={webhookUsername} onChange={e => setWebhookUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Password</label>
                <div className="relative">
                  <input 
                    type={showWebhookPassword ? "text" : "password"} 
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                    value={webhookPassword} 
                    onChange={e => setWebhookPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookPassword(!showWebhookPassword)}
                    className="absolute right-3 top-1/4 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <i className={`fa-solid ${showWebhookPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          {/* Syslog Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-server text-indigo-400 text-xl"></i>
              <h3 className="text-lg font-semibold text-slate-800">Syslog Settings</h3>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={syslogEnabled} onChange={e => setSyslogEnabled(e.target.checked)} />
              Enable Syslog
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Host</label>
                <input required className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" value={syslogHost} onChange={e => setSyslogHost(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Port</label>
                <input type="number" required className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" value={syslogPort} onChange={e => setSyslogPort(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          {/* Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <i className="fa-solid fa-lock text-indigo-400 text-xl"></i>
              <h3 className="text-lg font-semibold text-slate-800">Security</h3>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={autolockEnabled} onChange={e => setAutolockEnabled(e.target.checked)} />
              Enable Auto Lock User
            </label>
          </div>
          <div className="pt-2 flex items-center gap-4">
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 gap-2">
              <i className="fa-solid fa-floppy-disk"></i>
              Save Settings
            </button>
            <p className="text-sm text-gray-500">{msg}</p>
          </div>
        </form>
      </div>
    </div>
  );
}
