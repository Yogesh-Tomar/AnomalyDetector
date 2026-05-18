import { useState, useEffect } from "react";
import { endpoints } from "../services/api";

export function NetworkManagement() {
  const [Networks, setNetworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    networkId: "",
    subnetz: "",
    description: ""
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNetworks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await endpoints.getNetworks();
      setNetworks(res.data);
    } catch {
      setError("Failed to load Network entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNetworks(); }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setError("");
    if (!form.subnetz) { setMsg("Subnetz required."); return; }
    try {
      if (editId) {
        // Pass networkId for update
        await endpoints.updateNetwork(editId, form);
        setMsg("Network entry updated!");
      } else {
        // Omit networkId for create
        const { subnetz, description } = form;
        await endpoints.createNetwork({ subnetz, description });
        setMsg("Network entry created!");
      }
      setForm({ networkId: "", subnetz: "", description: "" });
      setEditId(null);
      fetchNetworks();
    } catch {
      setError(editId ? "Failed to update Network entry" : "Failed to create Network entry");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    setActionLoading(id); setError("");
    try {
      await endpoints.deleteNetwork(id);
      fetchNetworks();
    } catch {
      setError("Failed to delete entry");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleEdit(id: string) {
    setActionLoading(id);
    setError("");
    try {
      const res = await endpoints.getNetworkById(id);
      setForm({
        networkId: res.data.networkId || "",
        subnetz: res.data.subnetz || "",
        description: res.data.description || ""
      });
      setEditId(id);
    } catch {
      setError("Failed to load entry for editing");
    } finally {
      setActionLoading(null);
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    setForm({ networkId: "", subnetz: "", description: "" });
    setMsg("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-900">Network</h2>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Management</span>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded-xl">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Network ID</th>
                      <th className="px-4 py-3 text-left">Subnetz</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Networks.map((c, i) => (
                      <tr key={c.networkId || i} className="border-b last:border-0">
                        <td className="px-4 py-2">{c.networkId}</td>
                        <td className="px-4 py-2">{c.subnetz}</td>
                        <td className="px-4 py-2">{c.description}</td>
                        <td className="px-4 py-2">{typeof c.createdUtc === "string" ? c.createdUtc.slice(0, 19).replace('T', ' ') : ""}</td>
                        <td className="px-4 py-2 text-center flex gap-2 justify-center">
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-yellow-100 bg-white text-yellow-600 hover:bg-yellow-50"
                            title="Edit"
                            disabled={actionLoading === c.networkId}
                            onClick={() => handleEdit(c.networkId)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50"
                            title="Delete"
                            disabled={actionLoading === c.networkId}
                            onClick={() => handleDelete(c.networkId)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Create/Edit Form */}
          <div className="w-full md:w-[26rem] bg-white rounded-2xl shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <i className={`fa-solid ${editId ? "fa-pen" : "fa-plus"} text-indigo-500`}></i>
              {editId ? "Edit Network" : "Add Network"}
            </h3>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="subnetz" className="block text-sm font-medium text-gray-700 mb-1">Subnetz</label>
                <input type="text" id="subnetz" required className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.subnetz} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" id="description" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.description} onChange={handleChange} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow transition">
                  {editId ? "Update" : "Create"}
                </button>
                {editId && (
                  <button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow transition" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
              <p className="text-sm mt-2 text-green-600">{msg}</p>
              {error && <p className="text-sm mt-2 text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}