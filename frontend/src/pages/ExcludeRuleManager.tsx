import { useEffect, useState } from 'react';
import { endpoints } from '../services/api';

interface ExcludeRule {
  id: number;
  agentId: string;
  metric: number;
  keyId: number;
  keyLike: string;
  userLike: string;
  processLike: string;
  reason: string;
  effectiveFromUtc: string;
  effectiveUntilUtc: string;
  isEnabled: boolean;
  [key: string]: any;
}

export function ExcludeRulesManager() {
  const [rules, setRules] = useState<ExcludeRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<ExcludeRule | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExcludeRule>>({});
  const [error, setError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await endpoints.getWhiteListRules();
      setRules(res.data || []);
    } catch (err) {
      setError('Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openEditModal = (rule: ExcludeRule) => {
    setEditingRule(rule);
    setEditForm({ ...rule });
  };

  const closeEditModal = () => {
    setEditingRule(null);
    setEditForm({});
    setModalLoading(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setModalLoading(true);
    setError(null);
    try {
      await endpoints.updateWhiteListRule(editingRule.ruleId, editForm);
      closeEditModal();
      fetchRules();
    } catch (err) {
      setError('Failed to update rule');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this rule?')) return;
    setLoading(true);
    setError(null);
    try {
      await endpoints.deleteWhiteList(id);
      fetchRules();
    } catch (err) {
      setError('Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-900">Exclude (Whitelist) Rules</h2>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Management</span>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {loading ? (
            <div className="text-gray-500">Loading rules...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-xl">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Agent ID</th>
                    <th className="px-4 py-3 text-left">Metric</th>
                    <th className="px-4 py-3 text-left">Key ID</th>
                    <th className="px-4 py-3 text-left">Key Like</th>
                    <th className="px-4 py-3 text-left">User Like</th>
                    <th className="px-4 py-3 text-left">Process Like</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Effective From</th>
                    <th className="px-4 py-3 text-left">Effective Until</th>
                    <th className="px-4 py-3 text-center">Enabled</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.ruleId} className="border-b last:border-0">
                      <td className="px-4 py-2">{rule.ruleId}</td>
                      <td className="px-4 py-2">{rule.agentId}</td>
                      <td className="px-4 py-2">{rule.metric}</td>
                      <td className="px-4 py-2">{rule.keyId}</td>
                      <td className="px-4 py-2">{rule.keyLike}</td>
                      <td className="px-4 py-2">{rule.userLike}</td>
                      <td className="px-4 py-2">{rule.processLike}</td>
                      <td className="px-4 py-2">{rule.reason}</td>
                      <td className="px-4 py-2">{rule.effectiveFromUtc ? new Date(rule.effectiveFromUtc).toLocaleString() : ''}</td>
                      <td className="px-4 py-2">{rule.effectiveUntilUtc ? new Date(rule.effectiveUntilUtc).toLocaleString() : ''}</td>
                      <td className="px-4 py-2 text-center">{rule.isEnabled ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-blue-100 bg-white text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(rule.ruleId)}
                          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-200 transition"
                          title="Delete"
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

          {/* Edit Modal */}
          {editingRule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full h-4/5 max-w-lg p-6 relative overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                  onClick={closeEditModal}
                  title="Close"
                >
                  &times;
                </button>
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-pen text-blue-500"></i> Edit Exclude Rule
                </h3>
                <form className="space-y-5" onSubmit={handleUpdate}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
                    <input
                      type="text"
                      name="agentId"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.agentId || ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <input
                      type="number"
                      name="metric"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.metric ?? ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                    <input
                      type="number"
                      name="keyId"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.keyId ?? ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Like</label>
                    <input
                      type="text"
                      name="keyLike"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.keyLike || ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Like</label>
                    <input
                      type="text"
                      name="userLike"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.userLike || ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Process Like</label>
                    <input
                      type="text"
                      name="processLike"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed"
                      value={editForm.processLike || ''}
                      onChange={handleEditChange}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      name="reason"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={editForm.reason || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective From (UTC)</label>
                    <input
                      type="datetime-local"
                      name="effectiveFromUtc"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={editForm.effectiveFromUtc?.slice(0, 16) || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Until (UTC)</label>
                    <input
                      type="datetime-local"
                      name="effectiveUntilUtc"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={editForm.effectiveUntilUtc?.slice(0, 16) || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isEnabled"
                      checked={!!editForm.isEnabled}
                      onChange={handleEditChange}
                      id="edit-exclude-enabled"
                    />
                    <label htmlFor="edit-exclude-enabled" className="text-sm text-gray-700">Enabled</label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
                    disabled={modalLoading}
                  >
                    {modalLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  {error && <p className="text-sm mt-2 text-red-500">{error}</p>}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}