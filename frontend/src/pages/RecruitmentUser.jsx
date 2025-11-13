import { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";

const RecruitmentUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const validateForm = () => {
    const errors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = "Valid email is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [formData, setFormData] = useState({
  email: "",
  username: "",
  full_name: "",
  role: "", // ✅ valid
  is_active: true,
  is_superuser: false,
  password: "",
});


  const roles = ["ADMIN", "HR_SPOC", "EMPLOYER", "MANAGER", "RECRUITER"];

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      if (Array.isArray(res)) setUsers(res);
      else if (Array.isArray(res.data)) setUsers(res.data);
      else if (Array.isArray(res.users)) setUsers(res.users);
      else if (Array.isArray(res.items)) setUsers(res.items);
      else setUsers([]);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filters
  const filteredUsers = users.filter((u) => {
    const searchMatch =
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "active" ? u.is_active : !u.is_active);
    return searchMatch && statusMatch;
  });

  // ✅ Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        let payload = { ...formData };

        // ✅ Don't send empty password on update
        if (editingUser && !formData.password) {
          delete payload.password;
        }

        // ✅ Ensure role is not empty
        if (!payload.role) {
          alert("Please select a role before saving.");
          return;
        }

        if (editingUser) {
          await usersAPI.update(editingUser.id, payload);
        } else {
          await usersAPI.create(payload);
        }

        setShowForm(false);
        setEditingUser(null);
        resetForm();
        loadUsers();
      } catch (err) {
        console.error("Error saving user:", err);
      }
  };

  const resetForm = () => {
  setFormData({
    email: "",
    username: "",
    full_name: "",
    role: "", // ✅ valid default
    is_active: true,
    is_superuser: false,
    password: "",
  });
};


  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      password: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersAPI.delete(id);
        loadUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600">Manage users and their roles</p>
          </div>

        <button
          className="btn-primary flex items-center"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, username, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto overflow-y-auto max-h-[500px]">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.length > 0 ? (
                currentUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    {/* Serial number */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-sm">{u.username}</td>
                    <td className="px-6 py-4 text-sm">{u.role}</td>
                    <td className="px-6 py-4 text-sm">{u.is_active ? "✅" : "❌"}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => setViewUser(u)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEdit(u)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6 text-sm">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <p>
              <strong>ID:</strong> {viewUser.id}
            </p>
            <p>
              <strong>Email:</strong> {viewUser.email}
            </p>
            <p>
              <strong>Username:</strong> {viewUser.username}
            </p>
            <p>
              <strong>Full Name:</strong> {viewUser.full_name || "-"}
            </p>
            <p>
              <strong>Role:</strong> {viewUser.role}
            </p>
            <p>
              <strong>Active:</strong> {viewUser.is_active ? "Yes" : "No"}
            </p>
            <p>
              <strong>Superuser:</strong> {viewUser.is_superuser ? "Yes" : "No"}
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewUser(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <h2 className="text-lg font-bold mb-4">
              {editingUser ? "Edit User" : "Add User"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input-field w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}

              <input
                type="text"
                name="username"
                placeholder="Username"
                className="input-field w-full"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                className="input-field w-full"
                value={formData.full_name}
                onChange={handleChange}
              />
              <select
                name="role"
                className="input-field w-full"
                value={formData.role}
                onChange={handleChange}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_superuser"
                  checked={formData.is_superuser}
                  onChange={handleChange}
                />
                Superuser
              </label>
              {!editingUser && (
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="input-field w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  {editingUser ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentUser;
