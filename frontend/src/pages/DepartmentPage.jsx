import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { departmentsAPI } from "../services/api";
import CreateDepartmentForm from "../components/CreateDepartmentForm";

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentsAPI.getDepartments({});
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Error fetching departments", err);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      await departmentsAPI.deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete department", err);
      alert("Failed to delete department");
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (d) => {
    setEditingDepartment(d);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchDepartments();
    setShowForm(false);
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sub_department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage your company departments</p>
        </div>
        <button className="btn-primary flex items-center" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by department or sub-department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">S.No</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Sub Department</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Created At</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : currentItems.length ? (
              currentItems.map((d, index) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-4">{d.name}</td>
                  <td className="px-6 py-4">{d.sub_department || "-"}</td>
                  <td className="px-6 py-4">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEdit(d)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </h2>
            <CreateDepartmentForm
              onCreated={handleFormSuccess}
              initialData={editingDepartment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentPage;
