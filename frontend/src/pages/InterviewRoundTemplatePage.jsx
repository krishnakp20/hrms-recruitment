import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { interviewRoundTemplatesAPI } from "../services/api";
import CreateInterviewRoundTemplateForm from "../components/CreateInterviewRoundTemplateForm";

const InterviewRoundTemplatePage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await interviewRoundTemplatesAPI.getTemplates({});
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Error fetching interview round templates", err);
      setError("Failed to load interview round templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await interviewRoundTemplatesAPI.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete template", err);
      alert("Failed to delete template");
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEdit = (t) => {
    setEditingTemplate(t);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchTemplates();
    setShowForm(false);
    setEditingTemplate(null);
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Rounds</h1>
          <p className="text-gray-600">Manage the interview rounds</p>
        </div>
        <button className="btn-primary flex items-center" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Round
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
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="card overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">S.No</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Order</th>
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
              currentItems.map((t, index) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-6 py-4">{t.name}</td>
                  <td className="px-6 py-4">{t.description || "-"}</td>
                  <td className="px-6 py-4">{t.order}</td>
                  <td className="px-6 py-4">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(t.id)}
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
                  No templates found.
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
              {editingTemplate ? "Edit Round" : "Create Round"}
            </h2>
            <CreateInterviewRoundTemplateForm
              onCreated={handleFormSuccess}
              initialData={editingTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoundTemplatePage;
