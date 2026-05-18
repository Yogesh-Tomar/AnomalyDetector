import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { endpoints } from "../services/api";

const initialGroups = [
  { name: "Red Team", config: "Config A", agents: 5 },
  { name: "Blue Team", config: "Config B", agents: 3 },
];
const configOptions = ["Config A", "Config B", "Config C"];

export function Groups() {
  const location = useLocation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [configOptions, setConfigOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", config: configOptions[0] });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Add search term state

  // Edit state
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [focusGroupId, setFocusGroupId] = useState<string | null>(null);

  // Fetch configurations dropdown from backend
  const fetchConfigOptions = async () => {
    try {
      const res = await endpoints.getConfigurationsDropdown();
      setConfigOptions(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, config: res.data[0].value || res.data[0].id }));
      }
    } catch (err: any) {
      setError("Failed to load configuration options");
    }
  };

  // Fetch groups from backend
  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await endpoints.getGroups();
      setGroups(res.data);
    } catch (err: any) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available agents for assignment
  const fetchAvailableAgents = async () => {
    setModalLoading(true);
    try {
      const res = await endpoints.getAgentDropdown();
      console.log(res.data);
      setAvailableAgents(res.data);
    } catch (err: any) {
      setError("Failed to load available agents");
    } finally {
      setModalLoading(false);
    }
  };

  // Show assign agents modal
  const showAssignAgentsModal = (group: any) => {
    setSelectedGroup(group);
    setShowModal(true);
    fetchAvailableAgents();
    
    // Pre-select agents that are already assigned to this group
    const currentAgentIds = group.agentIds || [];
    setSelectedAgents(currentAgentIds);
  };

  // Handle agent selection change
  const handleAgentSelectionChange = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  };

  // Assign agents to group
  const assignAgentsToGroup = async () => {
    if (!selectedGroup) return;
    
    setAssigning(true);
    try {
      await endpoints.assignAgentsToGroup(selectedGroup.groupId, selectedAgents);
      setMsg(`Agents successfully assigned to ${selectedGroup.name}`);
      setShowModal(false);
      await fetchGroups(); // Refresh groups list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign agents");
    } finally {
      setAssigning(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
    setSelectedAgents([]);
    setAvailableAgents([]);
    setSearchTerm(""); // Reset search term
  };

  // Start editing a group
  const startEditing = (group: any) => {
    setEditingGroup(group);
    setForm({ name: group.name, config: group.configurationId });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingGroup(null);
    setForm({ name: "", config: configOptions[0] });
  };

  // Update group
  const updateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setMsg("Group name is required.");
      return;
    }

    setUpdating(true);
    setMsg("");
    setError("");

    try {
      const groupData = {
        name: form.name,
        configurationId: form.config
      };

      await endpoints.updateGroup(editingGroup.groupId, groupData);
      setMsg("Group updated successfully!");
      setEditingGroup(null);
      setForm({ name: "", config: configOptions[0] });
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update group");
    } finally {
      setUpdating(false);
    }
  };

  // Delete group
  const deleteGroupHandler = async (group: any) => {
    if (!confirm(`Are you sure you want to delete the group "${group.name}"?`)) return;

    try {
      await endpoints.deleteGroup(group.groupId);
      setMsg("Group deleted successfully!");
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete group");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchConfigOptions();
  }, []);

  // pick up focus query/state (e.g., from configurations page eye icon)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focus = params.get("focus") || (location.state as any)?.focusGroupId;
    if (focus) setFocusGroupId(focus);
    // remove focus params so refresh doesn't re-highlight
    if (params.has("focus") || params.has("config")) {
      params.delete("focus");
      params.delete("config");
      navigate({
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : ""
      }, { replace: true, state: { ...location.state, focusGroupId: undefined } });
    }
  }, [location, navigate]);

  // auto-clear highlight after a short time
  useEffect(() => {
    if (!focusGroupId) return;
    const timer = setTimeout(() => setFocusGroupId(null), 4500);
    return () => clearTimeout(timer);
  }, [focusGroupId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.id.replace("new-group-", "")]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setMsg("Group name is required.");
      return;
    }

    setCreating(true);
    setMsg("");
    setError("");

    try {
      // Create group using API
      const groupData = {
        name: form.name,
        description: "dasd", // Add description field if needed
        configurationId: form.config // Assuming this maps to configuration ID
      };

      await endpoints.createGroup(groupData);
      
      // Reset form and show success message
      setForm({ name: "", config: configOptions[0] });
      setMsg("Group created successfully!");
      
      // Refresh the groups list
      await fetchGroups();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  const isEditing = editingGroup !== null;
  const formTitle = isEditing ? "Edit Group" : "Create New Group";
  const submitHandler = isEditing ? updateGroup : handleSubmit;
  const submitButtonText = isEditing ? (updating ? "Updating..." : "Update Group") : (creating ? "Creating..." : "Create Group");
  const submitDisabled = isEditing ? updating : creating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 sm:p-2 md:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 flex items-center gap-3">
          <i className="fa-solid fa-users text-indigo-500 text-2xl"></i>
          Groups
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Existing Groups */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Existing Groups</h3>
            <span className="text-xs text-gray-400">{groups.length} groups</span>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Loading groups...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map((g, i) => {
                    const isFocused = focusGroupId && (g.groupId === focusGroupId || g.id === focusGroupId);
                    return (
                    <tr
                      key={g.id || g.groupId || i}
                      className={`${isFocused ? "border-l-4 border-yellow-500" : ""} transition-colors`}
                      style={isFocused ? { backgroundColor: "#fef9c3" } : undefined} // inline to beat nth-child stripe
                    >
                      <td className="px-4 py-2">{g.name}</td>
                      <td className="px-4 py-2">{g.configurationName || g.configurationId}</td>
                      <td className="px-4 py-2">{g.agentCount || 0}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-5">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1" 
                            title="Assign agent"
                            onClick={() => showAssignAgentsModal(g)}
                          >
                            <i className="fa-solid fa-user-plus"></i> 
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-2" 
                            title="Edit group"
                            onClick={() => startEditing(g)}
                          >
                            <i className="fa-solid fa-edit"></i> 
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 flex items-center gap-1" 
                            title="Delete group"
                            onClick={() => deleteGroupHandler(g)}
                          >
                            <i className="fa-solid fa-trash"></i> 
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                  {groups.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No groups found. Create your first group below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Group Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-xl p-6 mx-auto">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className={`fa-solid ${isEditing ? 'fa-edit' : 'fa-plus'} text-indigo-400`}></i>
            {formTitle}
          </h3>
          <form className="space-y-5" onSubmit={submitHandler}>
            <div>
              <label htmlFor="new-group-name" className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
              <input 
                type="text" 
                id="new-group-name" 
                required 
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                value={form.name} 
                onChange={handleChange}
                disabled={submitDisabled}
              />
            </div>
            <div>
              <label htmlFor="new-group-config" className="block text-xs font-semibold text-slate-600 mb-1">Configuration</label>
             <select 
                id="new-group-config" 
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                value={form.config} 
                onChange={handleChange}
                disabled={submitDisabled}
              >
                {configOptions.map((c) => (
                  <option key={c.value || c.id} value={c.value || c.id}>
                    {c.text || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold text-base shadow transition-all flex items-center justify-center gap-2"
                disabled={submitDisabled}
              >
                {submitDisabled ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <i className={`fa-solid ${isEditing ? 'fa-save' : 'fa-plus'}`}></i>
                    {isEditing ? "Update Group" : "Create Group"}
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  disabled={submitDisabled}
                >
                  Cancel
                </button>
              )}
            </div>
            {msg && (
              <p className="text-sm text-green-600">{msg}</p>
            )}
          </form>
        </div>
      </div>

      {/* Assign Agents Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Assign Agents to {selectedGroup?.name}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Add search input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {modalLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-500">Loading agents...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableAgents
                    .filter(agent => (agent.name || agent.text).toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((agent) => (
                    <label key={agent.id || agent.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id || agent.value)}
                        onChange={(e) => handleAgentSelectionChange(agent.id || agent.value, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{agent.name || agent.text}</span>
                    </label>
                  ))}
                  {availableAgents.filter(agent => (agent.name || agent.text).toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No agents found</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  disabled={assigning}
                >
                  Cancel
                </button>
                <button
                  onClick={assignAgentsToGroup}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2"
                  disabled={assigning || modalLoading}
                >
                  {assigning ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Assigning...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
