import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { candidateProfileAPI } from "../services/api";

const CandidateProfileFields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  // const [form, setForm] = useState({
  //   field_name: "",
  //   field_type: "text",
  //   is_default: false,
  //   is_mandatory: false,
  // });

  // ✅ Field type labels mapping
  const fieldTypes = [
    { value: "single_line", label: "Single Line" },
    { value: "multi_line", label: "Multi Line" },
    { value: "number", label: "Number" },
    { value: "dropdown", label: "Dropdown" },
    { value: "date", label: "Date" },
  ];

  const getFieldTypeLabel = (value) => {
    const type = fieldTypes.find((t) => t.value === value);
    return type ? type.label : value;
  };

  // Form state with values
  const [form, setForm] = useState({
    field_name: "",
    field_type: "single_line", // default
    is_default: false,
    is_mandatory: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [viewField, setViewField] = useState(null);
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  });

  // Fetch all fields
  const fetchFields = async () => {
    try {
      setLoading(true);
      const res = await candidateProfileAPI.getAll();
      setFields(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch fields");
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (successModal.show) {
      const timer = setTimeout(() => {
        setSuccessModal({ show: false, message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successModal.show]);

  // Filtered fields by search
  const filteredFields = fields.filter(
    (f) =>
      f.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.field_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ date formatter helper
  const newDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "/");
  };

  // ✅ date + time formatter helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    // Example: "01 Sept 2025, 7:14:04 pm"
    return date.toLocaleString("en-GB", options).replace(/ /g, " ");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await candidateProfileAPI.update(editingId, form);
        setSuccessModal({ show: true, message: "Field updated successfully!" });
      } else {
        await candidateProfileAPI.create(form);
        setSuccessModal({ show: true, message: "Field created successfully!" });
      }
      setForm({
        field_name: "",
        field_type: "single_line",
        is_default: false,
        is_mandatory: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchFields();
    } catch (err) {
      console.error(err);
      setError("Failed to save field");
    }
  };

  const handleEdit = (field) => {
    setForm({
      field_name: field.field_name,
      field_type: field.field_type,
      is_default: field.is_default,
      is_mandatory: field.is_mandatory,
    });
    setEditingId(field.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      await candidateProfileAPI.delete(id);
      fetchFields();
      setSuccessModal({ show: true, message: "Field deleted successfully!" });
    } catch (err) {
      console.error(err);
      setError("Failed to delete field");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Profile</h1>
        <button
          className="btn-primary flex items-center"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </button>
      </div>

      {/* Search */}
      {/* <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div> */}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Optional: Field Type Dropdown */}
          <div className="sm:w-48">
            {/* <select
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="dropdown">Dropdown</option>
              <option value="date">Date</option>
            </select> */}
            <select
              value={form.field_type}
              onChange={(e) => setForm({ ...form, field_type: e.target.value })}
              className="input-field w-full"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mandatory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFields.map((field) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.field_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getFieldTypeLabel(field.field_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.is_default ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {field.is_mandatory ? "Yes" : "No"}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(field.created_at).toLocaleDateString("en-GB")}
                  </td> */}
                  {/* ✅ formatted date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {newDate(field.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setViewField(field)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => handleEdit(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFields.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No fields found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Field" : "Add Field"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Field Name"
                value={form.field_name}
                onChange={(e) =>
                  setForm({ ...form, field_name: e.target.value })
                }
                className="input-field w-full"
                required
              />
              {/* Field Type Dropdown */}
              <select
                value={form.field_type}
                onChange={(e) =>
                  setForm({ ...form, field_type: e.target.value })
                }
                className="input-field w-full"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) =>
                    setForm({ ...form, is_default: e.target.checked })
                  }
                />
                Default
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_mandatory}
                  onChange={(e) =>
                    setForm({ ...form, is_mandatory: e.target.checked })
                  }
                />
                Mandatory
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm({
                      field_name: "",
                      field_type: "text",
                      is_default: false,
                      is_mandatory: false,
                    });
                  }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-4 py-2">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl space-y-4 max-h-[70vh] p-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold mb-4">Field Details</h2>

              {/* Close button (top-right inside modal) */}
              <button
                onClick={() => setViewField(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <p>
              <strong>ID:</strong> {viewField.id}
            </p>
            <p>
              <strong>Name:</strong> {viewField.field_name}
            </p>
            <p>
              <strong>Type:</strong> {getFieldTypeLabel(viewField.field_type)}
            </p>
            <p>
              <strong>Default:</strong> {viewField.is_default ? "Yes" : "No"}
            </p>
            <p>
              <strong>Mandatory:</strong>{" "}
              {viewField.is_mandatory ? "Yes" : "No"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {/* {newDate(viewField.created_at).toLocaleString()} */}
              {formatDateTime(viewField.created_at)}
            </p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewField(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-green-600 mb-4">
              {successModal.message}
            </h2>
            <button
              onClick={() => setSuccessModal({ show: false, message: "" })}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfileFields;
