import { useMemo, useRef, useState, useEffect } from "react";
import { endpoints } from "../services/api";

export function CmdbManagement() {
  const [cmdbs, setCmdbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [form, setForm] = useState({
    cmdbId: "",
    ipAddress: "",
    hostname: "",
    networkId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [networks, setNetworks] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCmdbs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await endpoints.getCmdbs();
      setCmdbs(res.data);
    } catch {
      setError("Failed to load CMDB entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmdbs();
    // Fetch networks for dropdown
    const fetchNetworks = async () => {
      try {
        const res = await endpoints.getNetworks();
        setNetworks(res.data);
      } catch {
        setNetworks([]);
      }
    };
    fetchNetworks();
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(cmdbs.length / pageSize));
  }, [cmdbs.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [cmdbs.length]);

  const pagedCmdbs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return cmdbs.slice(start, start + pageSize);
  }, [cmdbs, page]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const networksById = useMemo(() => {
    const map = new Map<string, any>();
    for (const n of networks) {
      if (n?.networkId != null) map.set(String(n.networkId), n);
    }
    return map;
  }, [networks]);

  const networksByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of networks) {
      const id = n?.networkId != null ? String(n.networkId) : "";
      if (!id) continue;
      const subnetz = typeof n.subnetz === "string" ? n.subnetz.trim().toLowerCase() : "";
      const description = typeof n.description === "string" ? n.description.trim().toLowerCase() : "";
      if (subnetz) map.set(subnetz, id);
      if (description) map.set(description, id);

      // Also support combined labels like "<subnetz> - <description>"
      if (subnetz && description) map.set(`${subnetz} - ${description}`, id);
    }
    return map;
  }, [networks]);

  function normalizeKey(key: unknown) {
    return String(key ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[_-]+/g, "");
  }

  function resolveNetworkId(value: unknown): string | null {
    if (value == null) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    if (/^\d+$/.test(raw)) return raw;

    const lowered = raw.toLowerCase();
    const direct = networksByKey.get(lowered);
    if (direct) return direct;

    // Handle values like "192.168.0.0/24 - LAN" or "LAN" or "192.168.0.0/24"
    const parts = lowered
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);

    for (const part of parts) {
      const hit = networksByKey.get(part);
      if (hit) return hit;
      // If part contains extra text (e.g. CIDR + label), try first token.
      const token = part.split(/\s+/)[0]?.trim();
      if (token) {
        const tokenHit = networksByKey.get(token);
        if (tokenHit) return tokenHit;
      }
    }

    return null;
  }

  function parseCsvLine(line: string) {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    result.push(current.trim());
    return result;
  }

  type CmdbUploadEntry = { ipAddress: string; hostname?: string; networkId: string };

  function parseCsv(text: string): CmdbUploadEntry[] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    const header = parseCsvLine(lines[0]);
    const headerKeys = header.map((h) => normalizeKey(h));

    const idxIp = headerKeys.findIndex((k) => ["ipaddress", "ip", "ipaddr"].includes(k));
    const idxHost = headerKeys.findIndex((k) => ["hostname", "host", "name"].includes(k));
    const idxNet = headerKeys.findIndex((k) => ["networkid", "network", "subnetz", "subnet"].includes(k));

    const hasHeader = idxIp !== -1 || idxHost !== -1 || idxNet !== -1;
    const startRow = hasHeader ? 1 : 0;

    const entries: CmdbUploadEntry[] = [];
    for (let i = startRow; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const ipAddress = (cols[hasHeader ? idxIp : 0] ?? "").trim();
      const hostname = (cols[hasHeader ? idxHost : 1] ?? "").trim();
      const netRaw = cols[hasHeader ? idxNet : 2] ?? "";
      const networkId = resolveNetworkId(netRaw) ?? "";
      if (!ipAddress || !networkId) continue;
      entries.push({ ipAddress, hostname, networkId });
    }

    return entries;
  }

  function parseJson(text: string): CmdbUploadEntry[] {
    const parsed = JSON.parse(text);
    const rawEntries: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.entries)
        ? parsed.entries
        : Array.isArray(parsed?.cmdbs)
          ? parsed.cmdbs
          : [];

    const entries: CmdbUploadEntry[] = [];
    for (const raw of rawEntries) {
      const ipAddress = String(raw?.ipAddress ?? raw?.ip ?? "").trim();
      const hostname = String(raw?.hostname ?? raw?.host ?? "").trim();
      const networkId = resolveNetworkId(raw?.networkId ?? raw?.network ?? raw?.subnetz ?? raw?.subnet) ?? "";
      if (!ipAddress || !networkId) continue;
      entries.push({ ipAddress, hostname, networkId });
    }

    return entries;
  }

  type CmdbBulkUpsertResponse = {
    inserted?: number;
    updated?: number;
    failed?: number;
    errors?: Array<{ ipAddress?: string; message?: string }>;
  };

  function getNetworkDisplay(networkId: unknown) {
    if (networkId == null) return "";
    const n = networksById.get(String(networkId));
    if (!n) return String(networkId);

    const subnetz = typeof n.subnetz === "string" ? n.subnetz.trim() : "";
    const description = typeof n.description === "string" ? n.description.trim() : "";

    if (subnetz && description) return `${subnetz} - ${description}`;
    if (subnetz) return subnetz;
    if (description) return description;
    return String(networkId);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setError("");
    if (!form.ipAddress) { setMsg("IP Address required."); return; }
    try {
      if (editId) {
        // Pass cmdbId for update
        await endpoints.updateCmdb(editId, form);
        setMsg("CMDB entry updated!");
      } else {
        // Omit cmdbId for create
        const { ipAddress, hostname, networkId } = form;
        await endpoints.createCmdb({ ipAddress, hostname, networkId });
        setMsg("CMDB entry created!");
      }
      setForm({ cmdbId: "", ipAddress: "", hostname: "", networkId: "" });
      setEditId(null);
      fetchCmdbs();
    } catch {
      setError(editId ? "Failed to update CMDB entry" : "Failed to create CMDB entry");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this entry?")) return;
    setActionLoading(id); setError("");
    try {
      await endpoints.deleteCmdb(id);
      fetchCmdbs();
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
      const res = await endpoints.getCmdbById(id);
      setForm({
        cmdbId: res.data.cmdbId || "",
        ipAddress: res.data.ipAddress || "",
        hostname: res.data.hostname || "",
        networkId: res.data.networkId || "",
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
    setForm({ cmdbId: "", ipAddress: "", hostname: "", networkId: "" });
    setMsg("");
    setError("");
  }

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    setMsg("");
    setError("");
    try {
      const text = await uploadFile.text();
      const trimmed = text.trimStart();
      const looksJson = trimmed.startsWith("{") || trimmed.startsWith("[");
      const isJson = uploadFile.name.toLowerCase().endsWith(".json") || uploadFile.type === "application/json" || looksJson;
      const parsed = isJson ? parseJson(text) : parseCsv(text);

      if (parsed.length === 0) {
        setError("No valid entries found. Ensure ipAddress and networkId/subnetz are provided.");
        return;
      }

      const res = await endpoints.bulkUpsertCmdb({ entries: parsed.map(e => ({
        ipAddress: e.ipAddress,
        hostname: e.hostname ?? "",
        networkId: String(e.networkId),
      })) });

      const data = (res?.data ?? {}) as CmdbBulkUpsertResponse;
      const inserted = data.inserted ?? 0;
      const updated = data.updated ?? 0;
      const failed = data.failed ?? 0;

      if (inserted || updated) {
        setMsg(`Processed upload: inserted ${inserted}, updated ${updated}.`);
      }
      if (failed) {
        setError(`Some rows failed: ${failed}.`);
      }

      setUploadFile(null);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
      await fetchCmdbs();
    } catch {
      setError("Failed to process upload file. Please upload a valid CSV or JSON.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-900">CMDB</h2>
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
                      <th className="px-4 py-3 text-left">IP Address</th>
                      <th className="px-4 py-3 text-left">Hostname</th>
                      <th className="px-4 py-3 text-left">Network</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCmdbs.map((c, i) => (
                      <tr key={c.cmdbId || i} className="border-b last:border-0">
                        <td className="px-4 py-2">{c.ipAddress}</td>
                        <td className="px-4 py-2">{c.hostname}</td>
                        <td className="px-4 py-2">{getNetworkDisplay(c.networkId)}</td>
                        <td className="px-4 py-2">{typeof c.createdUtc === "string" ? c.createdUtc.slice(0, 19).replace('T', ' ') : ""}</td>
                        <td className="px-4 py-2 text-center flex gap-2 justify-center">
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-yellow-100 bg-white text-yellow-600 hover:bg-yellow-50"
                            title="Edit"
                            disabled={actionLoading === c.cmdbId}
                            onClick={() => handleEdit(c.cmdbId)}
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50"
                            title="Delete"
                            disabled={actionLoading === c.cmdbId}
                            onClick={() => handleDelete(c.cmdbId)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between mt-4 text-sm">
                  <div className="text-gray-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-disabled={!canPrev}
                      className={`px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 ${canPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => {
                        if (!canPrev) return;
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      aria-disabled={!canNext}
                      className={`px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 ${canNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => {
                        if (!canNext) return;
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Create/Edit Form */}
          <div className="w-full md:w-[26rem] bg-white rounded-2xl shadow border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <i className={`fa-solid ${editId ? "fa-pen" : "fa-plus"} text-indigo-500`}></i>
              {editId ? "Edit CMDB Entry" : "Add CMDB Entry"}
            </h3>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input type="text" id="ipAddress" required className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.ipAddress} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="hostname" className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
                <input type="text" id="hostname" className="w-full rounded-lg border border-gray-300 px-3 py-2" value={form.hostname} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="networkId" className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <select
                  id="networkId"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={form.networkId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Network</option>
                  {networks.map((n: any) => (
                    <option key={n.networkId} value={n.networkId}>
                      {n.subnetz} {n.description ? `- ${n.description}` : ""}
                    </option>
                  ))}
                </select>
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

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bulk upload</h4>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".csv,.json,.txt,application/json,text/csv,text/plain"
                  className="block w-full text-sm text-gray-700"
                  disabled={uploading}
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  CSV columns: <span className="font-semibold">ipAddress</span>, <span className="font-semibold">hostname</span>, <span className="font-semibold">networkId</span> (or <span className="font-semibold">subnetz</span>). JSON: array of objects.
                </p>
                <button
                  type="button"
                  className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2 rounded-lg shadow transition"
                  disabled={!uploadFile || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>

                {uploading && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
                    Upload in progress…
                  </div>
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