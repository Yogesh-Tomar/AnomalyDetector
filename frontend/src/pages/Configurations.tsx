import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../services/api";


export function Configurations() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editJson, setEditJson] = useState("");
  const [editName, setEditName] = useState(""); // For create
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editIsActive, setEditIsActive] = useState(false); // Add this line
  const [banner, setBanner] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  function fetchConfigs() {
    setLoading(true);
    endpoints.getConfigurations()
      .then((res: { data: any[] }) => {
        setConfigs(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load configurations");
        setLoading(false);
      });
  }

  function openModal(idx: number) {
    setEditIdx(idx);
    setEditJson(configs[idx].json);
    setEditName(configs[idx].name);
    setEditIsActive(!!configs[idx].isActive); // Set status for edit
    setIsCreating(false);
    setModalOpen(true);
    setMsg("");
  }

  function openCreateModal() {
    setEditIdx(null);
    setEditJson("{\n  \n}");
    setEditName("");
    setEditIsActive(false); // Default to Unused
    setIsCreating(true);
    setModalOpen(true);
    setMsg("");
  }

  function closeModal() {
    setModalOpen(false);
    setEditIdx(null);
    setEditJson("");
    setEditName("");
    setEditIsActive(false);
    setIsCreating(false);
    setMsg("");
  }

  function saveConfig() {
    try {
      JSON.parse(editJson);
      if (isCreating) {
        if (!editName.trim()) {
          setMsg("Name is required");
          return;
        }
        endpoints.createConfiguration({
          name: editName,
          json: editJson,
          isActive: editIsActive
        })
          .then(() => {
            setMsg("Created!");
            setTimeout(() => {
              closeModal();
              fetchConfigs();
            }, 800);
          })
          .catch(() => setMsg("Failed to create"));
      } else if (editIdx !== null) {
        const config = configs[editIdx];
        endpoints.updateConfiguration(config?.configStateId, {
          ...config,
          json: editJson,
          isActive: editIsActive
        })
          .then(() => {
            setMsg("Saved!");
            setTimeout(() => {
              closeModal();
              fetchConfigs();
            }, 800);
          })
          .catch(() => setMsg("Failed to save"));
      }
    } catch {
      setMsg("Invalid JSON");
    }
  }

  function deleteConfig(idx: number) {
    const config = configs[idx];
    if (!window.confirm(`Delete configuration "${config.name}"?`)) return;
    endpoints.deleteConfiguration(config?.configStateId) // Adjust key as per your API
      .then(() => {
        setBanner({ tone: "success", text: `"${config.name}" deleted.` });
        fetchConfigs();
      })
      .catch((err) => {
        const apiMsg = err?.response?.data ?? "Failed to delete configuration";
        setBanner({ tone: "error", text: apiMsg });
      });
  }

  function goToGroup(config: any) {
    const target = config?.usedByGroupId;
    const name = config?.usedByGroupName;
    const search = target ? `?focus=${target}&config=${config.configStateId}` : "";
    setBanner(null);
    navigate(`/groups${search}`, { state: { focusGroupId: target, focusGroupName: name } });
  }

  // Modal close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <i className="fa-solid fa-sliders text-indigo-500 text-2xl"></i>
            Configurations
          </h2>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
            onClick={openCreateModal}
          >
            <i className="fa-solid fa-plus"></i> New Configuration
          </button>
        </div>
        {banner && (
          <div className={`mb-4 px-3 py-2 rounded border text-sm ${
            banner.tone === "error"
              ? "border-red-200 text-red-800 bg-red-50"
              : "border-green-200 text-green-800 bg-green-50"
          }`}>
            {banner.text}
          </div>
        )}
        {loading ? (
          <div className="text-gray-400 py-10 text-center">Loading...</div>
        ) : error ? (
          <div className="text-red-500 py-10 text-center">{error}</div>
        ) : (
          <section className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-0 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 pl-6 pr-3">Configuration</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c, i) => (
                    <tr key={i} className="border-t last:border-b-0">
                      <td className="py-3 pl-6 pr-3 font-medium">{c.name}</td>
                      <td className="py-3 px-3">
                        {c.isUsed ? (
                          <span className="chip chip--success">
                            <span className="dot"></span>
                            Used{c.usedByGroupName ? ` by ${c.usedByGroupName}` : ""}
                          </span>
                        ) : (
                          <span className="chip chip--danger">
                            <span className="dot"></span>
                            Unused
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-6 text-right flex gap-2 justify-end">
                        <button className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium" onClick={() => openModal(i)}>
                          <i className="fa-solid fa-pen-to-square"></i> 
                        </button>
                        {c.isUsed ? (
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium"
                            title={c.usedByGroupName ? `View group "${c.usedByGroupName}"` : "View groups"}
                            onClick={() => goToGroup(c)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        ) : (
                          <button className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium" onClick={() => deleteConfig(i)}>
                            <i className="fa-solid fa-trash"></i> 
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal Overlay */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-pen-to-square text-indigo-500"></i>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isCreating ? "New Configuration" : "Edit Configuration"}
                  </h2>
                </div>
                <button className="text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeModal}>&times;</button>
              </div>
              {isCreating && (
                <input
                  className="w-full mb-4 border border-gray-200 rounded-lg p-2 font-mono text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Configuration Name"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              )}
              {/* Status Toggle */}
              {/* <div className="mb-4 flex items-center gap-3">
                <label className="font-medium text-gray-700">Status:</label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox accent-indigo-600"
                    checked={editIsActive}
                    onChange={e => setEditIsActive(e.target.checked)}
                  />
                  <span className="ml-2">{editIsActive ? "Used" : "Unused"}</span>
                </label>
              </div> */}
              <textarea className="w-full h-64 border border-gray-200 rounded-lg p-3 font-mono text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editJson} onChange={e => setEditJson(e.target.value)} />
              <div className="mt-6 flex justify-end gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-medium" onClick={closeModal}>
                  <i className="fa-solid fa-xmark"></i> Cancel
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium" onClick={saveConfig}>
                  <i className="fa-solid fa-floppy-disk"></i> Save
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">{msg}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
