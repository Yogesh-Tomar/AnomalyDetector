import { useState, useEffect } from "react";
import { endpoints } from "../services/api";


export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Analyst",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // user id for which action is in progress
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await endpoints.getUsers();
      setUsers(res.data);
    } catch (err: any) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.id.replace("new-user-", "")]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!form.username || !form.email || (!editUser && !form.password)) {
      setMsg("All fields are required.");
      return;
    }
    try {
      if (editUser) {
        await endpoints.updateUser(editUser.id, {
          email: form.email,
          role: form.role,
          isActive: editUser.isActive,
        });
        setMsg("User updated!");
      } else {
        await endpoints.createUser({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setMsg("User created!");
      }
      setForm({ username: "", email: "", password: "", role: "Analyst" });
      fetchUsers();
      closeModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save user");
    }
  }

  // User actions
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this user?")) return;
    setActionLoading(id);
    setError("");
    try {
      await endpoints.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleStatus(id: string) {
    setActionLoading(id);
    setError("");
    try {
      await endpoints.toggleStatus(id);
      fetchUsers();
    } catch (err: any) {
      setError("Failed to toggle status");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword(id: string) {
    const newPassword = window.prompt("Enter new password:");
    if (!newPassword) return;
    setActionLoading(id);
    setError("");
    try {
      await endpoints.resetPassword(id, newPassword);
      setMsg("Password reset!");
    } catch (err: any) {
      setError("Failed to reset password");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleRole(id: string) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    // Check if authType is local
    if (user.authType && user.authType !== 'local') {
      setError("Cannot change role for non-local users");
      return;
    }

    // Check if trying to change the last Admin
    const adminCount = users.filter(u => u.role === 'Admin').length;
    if (user.role === 'Admin' && adminCount <= 1) {
      setError("Cannot change role: this is the last Admin");
      return;
    }

    // Toggle role
    const newRole = user.role === 'Admin' || user.role === 'admin' ? 'Analyst' : 'Admin';

    setActionLoading(id);
    setError("");
    try {
      await endpoints.updateUser(id, {
        email: user.email,
        role: newRole,
        isActive: user.isActive
      });
      fetchUsers();
      setMsg("Role updated!");
    } catch (err: any) {
      setError("Failed to update role");
    } finally {
      setActionLoading(null);
    }
  }

  function openCreateModal() {
    setEditUser(null);
    setForm({ username: "", email: "", password: "", role: "Analyst" });
    setModalOpen(true);
  }

  function openEditModal(user: any) {
    setEditUser(user);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditUser(null);
    setMsg("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto mb-5">
        {/* Button to open modal */}
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            onClick={openCreateModal}
          >
            <i className="fa-solid fa-user-plus mr-2"></i> Register New User
          </button>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={closeModal}
          />
          {/* Modal Panel */}
          <div
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl transition-transform duration-300 flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b rounded-t-xl">
              <h3 className="text-xl font-semibold text-blue-900">
                {editUser ? "Update User" : "Register New User"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-700"
                onClick={closeModal}
                aria-label="Close"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form
              className="p-6 space-y-5 overflow-y-auto"
              style={{ maxHeight: 'calc(90vh - 64px)' }}
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="new-user-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input type="text" id="new-user-username" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={form.username} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="new-user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="new-user-email" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={form.email} onChange={handleChange} />
                </div>
                {!editUser && (
                  <div>
                    <label htmlFor="new-user-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="new-user-password" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={form.password} onChange={handleChange} />
                  </div>
                )}
                <div>
                  <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select id="new-user-role" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={form.role} onChange={handleChange}>
                    <option value="Analyst">Analyst</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow transition">
                {editUser ? "Update User" : "Create User"}
              </button>
              <p className="text-sm mt-2 text-green-600">{msg}</p>
              {error && <p className="text-sm mt-2 text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="max-w-12xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Users Table */}
          <div className="flex-1 bg-white rounded-2xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-900">Users</h2>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Management</span>
            </div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-gray-500">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded-xl">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Username</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Auth Type</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-center">Active</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id || i} className="border-b last:border-0">
                        <td className="px-4 py-2">{u.username}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.authType || 'Local'}</td>
                        <td className="px-4 py-2 capitalize"><span className={`chip ${u.role === 'Admin' ? 
                          'chip--success' : 'chip--warning'}`}>{u.role}</span></td>
                        <td className="px-4 py-2 text-center">
                          {u.isActive ? (
                            <><span className="chip chip--success"><span className="dot"></span>Active</span></>
                          ) : (
                            <span className="inline-block w-3 h-3 rounded-full bg-gray-300" title="Inactive"></span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center flex gap-2 justify-center">                          
                          {/* Toggle role */}
                          {(u.authType === 'local') && (
                            <button
                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-green-100 bg-white text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-200 transition"
                              title="Toggle Role"
                              disabled={actionLoading === u.id}
                              onClick={() => handleToggleRole(u.id)}
                            >
                              <i className="fa-solid fa-exchange-alt text-lg"></i>
                            </button>
                          )}
                          {/* Reset password */}
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-200 transition"
                            title="Reset Password"
                            disabled={actionLoading === u.id}
                            onClick={() => handleResetPassword(u.id)}
                          >
                            <i className="fa-solid fa-key text-lg"></i>
                          </button>
                          {/* Toggle status */}
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-yellow-100 bg-white text-yellow-600 hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-200 transition"
                            title="Toggle Status"
                            disabled={actionLoading === u.id}
                            onClick={() => handleToggleStatus(u.id)}
                          >
                            <i className="fa-solid fa-user-slash text-lg"></i>
                          </button>
                          {/* Delete */}
                          <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-200 transition"
                            title="Delete"
                            disabled={actionLoading === u.id}
                            onClick={() => handleDelete(u.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                          {/* Edit user */}
                          {/* <button
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-blue-100 bg-white text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition"
                            title="Edit User"
                            disabled={actionLoading === u.id}
                            onClick={() => openEditFlyout(u)}
                          >
                            <i className="fa-solid fa-pen text-lg"></i>
                          </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>          
        </div>
      </div>
    </div>
  );
}