import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { workflowTemplateAPI } from "../services/api";

const RecruitmentWorkflowTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [stepName, setStepName] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    steps: [],
    is_active: true, // ✅ always a string in frontend
  });
  const [stageInput, setStageInput] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  });
  const [statusFilter, setStatusFilter] = useState(""); // ✅ New state for status filter

  // Fetch all templates
  // const fetchTemplates = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await workflowTemplateAPI.getAll();
  //     setTemplates(res.data);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch workflow templates");
  //     setTemplates([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //  const fetchTemplates = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await workflowTemplateAPI.getAll();
  //     // Ensure steps are parsed if backend returns JSON strings
  //     const data = res.data.map((t) => ({
  //       ...t,
  //       steps: Array.isArray(t.steps)
  //         ? t.steps
  //         : t.steps
  //         ? JSON.parse(t.steps)
  //         : [],
  //     }));
  //     setTemplates(data);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to fetch workflow templates");
  //     setTemplates([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await workflowTemplateAPI.getAll();
      const data = res.data.map((t) => ({
        ...t,
        steps: Array.isArray(t.steps) ? t.steps : [], // ✅ keep as list
      }));
      setTemplates(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch workflow templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (successModal.show) {
      const timer = setTimeout(() => {
        setSuccessModal({ show: false, message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successModal.show]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const payload = {
      //   name: form.name,
      //   description: form.description,
      //   steps: form.steps.join(", "),
      //   is_active: form.is_active ? 1 : 0, // backend expects tinyint// ✅ backend expects this
      // };

      //   const payload = {
      //   name: form.name,
      //   description: form.description,
      //   steps: JSON.stringify(form.steps), // ✅ store full objects
      //   is_active: form.is_active ? 1 : 0,
      // };

      const payload = {
        name: form.name,
        description: form.description,
        steps: form.steps, // ✅ send as real array, not string
        is_active: form.is_active ? 1 : 0,
      };

      console.log("Submitting payload:", payload);

      if (editingId) {
        await workflowTemplateAPI.update(editingId, payload);
        setSuccessModal({
          show: true,
          message: "Template updated successfully!",
        });
      } else {
        await workflowTemplateAPI.create(payload);
        setSuccessModal({
          show: true,
          message: "Template created successfully!",
        });
      }

      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error("Error submitting template:", err.response?.data || err);
      setError("Failed to save template");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", steps: [], is_active: true }); // ✅ reset to string
    setStageInput({ name: "", description: "" });
    setEditingId(null);
    setEditingIndex(null);
    setShowForm(false);
  };

  // const handleEdit = (template) => {
  //   setForm({
  //     name: template.name,
  //     description: template.description,
  //   steps: Array.isArray(template.steps)
  //     ? template.steps.join(", ")
  //     : template.steps || "",
  //   is_active: !!template.is_active, // ✅ map backend → frontend
  //   });
  //   setEditingId(template.id);
  //   setShowForm(true);
  // };

  const handleEdit = (template) => {
    setForm({
      name: template.name,
      description: template.description,
      steps: Array.isArray(template.steps)
        ? template.steps
        : template.steps
        ? JSON.parse(template.steps)
        : [],
      is_active: !!template.is_active,
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    try {
      await workflowTemplateAPI.delete(id);
      fetchTemplates();
      setSuccessModal({
        show: true,
        message: "Template deleted successfully!",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to delete template");
    }
  };

  // Filter templates by search + status

  // const filteredTemplates = templates.filter((template) => {
  //   const lowerSearch = searchTerm.toLowerCase();

  //   const matchesSearch =
  //     template.template_name.toLowerCase().includes(lowerSearch) ||
  //     (template.description?.toLowerCase().includes(lowerSearch) ?? false);

  //   const matchesStatus =
  //     selectedStatus === "" ||
  //     selectedStatus.toLowerCase() === "all" ||
  //     template.status.toLowerCase() === selectedStatus.toLowerCase();

  //   return matchesSearch && matchesStatus;
  // });

  // Filter templates by search + status
  const filteredTemplates = templates.filter((template) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      (template.name?.toLowerCase().includes(lowerSearch) ?? false) ||
      (template.description?.toLowerCase().includes(lowerSearch) ?? false) ||
      (Array.isArray(template.steps)
        ? template.steps.some(
            (s) =>
              s.name?.toLowerCase().includes(lowerSearch) ||
              s.description?.toLowerCase().includes(lowerSearch)
          )
        : false);

    const matchesStatus =
      selectedStatus === "" ||
      selectedStatus.toLowerCase() === "all" ||
      (template.is_active ? "active" : "inactive") ===
        selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // ✅ date formatter helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };

    return date.toLocaleDateString("en-GB", options).replace(/ /g, "/");
  };

  const getStatusColor = (isActive) => {
    if (isActive === true) {
      return "bg-green-100 text-green-800"; // Active
    } else if (isActive === false) {
      return "bg-red-100 text-red-800"; // Inactive
    }
    return "bg-gray-100 text-gray-800"; // Default / null
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
          Recruitment Workflows
        </h1>
        <p className="text-gray-600">Manage recruitment workflows and stages</p>
        </div>
        <button
          className="btn-primary flex items-center"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Template
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
                placeholder="Search by name or status..."
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

      {/* Recruitment Workflow Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Steps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {t.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Array.isArray(t.steps) ? t.steps.length : 0}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        t.is_active
                      )}`}
                    >
                      {t.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => setViewTemplate(t)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
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
                  </td>
                </tr>
              ))}
              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-6">
                    No templates found
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
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[70vh] p-6 overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingId
                ? "Edit Recruitment Workflow Template"
                : "Add Recruitment Workflow Template"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recruitment Workflow Template Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Recruitment Stages Section */}
              <div>
                <label className="block text-sm font-medium text-pink-600 mb-2">
                  Recruitment Stages
                </label>
                <div className="space-y-2 mb-3">
                  {form.steps.length > 0 ? (
                    form.steps.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-start border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-sm text-gray-600">
                            {s.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-blue-500 text-xs"
                            onClick={() => {
                              setStageInput(s);
                              setEditingIndex(i);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-500 text-xs"
                            onClick={() => {
                              const updated = form.steps.filter(
                                (_, idx) => idx !== i
                              );
                              setForm({ ...form, steps: updated });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No stages added yet.
                    </p>
                  )}
                </div>

                {/* Stage Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Stage Name"
                    value={stageInput?.name || ""}
                    onChange={(e) =>
                      setStageInput({ ...stageInput, name: e.target.value })
                    }
                    className="flex-1 border rounded p-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={stageInput?.description || ""}
                    onChange={(e) =>
                      setStageInput({
                        ...stageInput,
                        description: e.target.value,
                      })
                    }
                    className="flex-1 border rounded p-2"
                    rows={1}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        stageInput?.name?.trim() &&
                        stageInput?.description?.trim()
                      ) {
                        if (editingIndex !== null) {
                          const updated = [...form.steps];
                          updated[editingIndex] = {
                            name: stageInput.name.trim(),
                            description: stageInput.description.trim(),
                          };
                          setForm({ ...form, steps: updated });
                          setEditingIndex(null);
                        } else {
                          setForm({
                            ...form,
                            steps: [
                              ...form.steps,
                              {
                                name: stageInput.name.trim(),
                                description: stageInput.description.trim(),
                              },
                            ],
                          });
                        }
                        setStageInput({ name: "", description: "" });
                      }
                    }}
                    className="btn-primary text-white px-4 py-2 rounded"
                  >
                    {editingIndex !== null ? "Update" : "Add"}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.value === "active" })
                  }
                  className="w-full border rounded p-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl space-y-4 max-h-[70vh] p-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold mb-4">Template Details</h2>

              {/* Close Button */}
              <button
                onClick={() => setViewTemplate(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {/* Template Info */}
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {viewTemplate.id}
              </p>
              <p>
                <strong>Name:</strong>{" "}
                {viewTemplate.name || viewTemplate.template_name}
              </p>

              {/* Stages Section */}
              <div>
                <strong>Stages:</strong>
                {Array.isArray(viewTemplate.steps) &&
                viewTemplate.steps.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {viewTemplate.steps.map((s, i) => (
                      <li key={i}>
                        <p>
                          <strong>Stage {i + 1} Name:</strong> {s.name}
                        </p>
                        <p>
                          <strong>Description:</strong> {s.description || "-"}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">No stages added</p>
                )}
              </div>

              <p>
                <strong>Status:</strong>{" "}
                {viewTemplate.is_active ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {viewTemplate.created_at
                  ? formatDateTime(viewTemplate.created_at)
                  : "N/A"}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewTemplate(null)}
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

export default RecruitmentWorkflowTemplates;

// {viewTemplate && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto p-4">
//     <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full space-y-4 relative">

//       {/* Header */}
//       <div className="flex justify-between items-center border-b pb-2">
//         <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-500">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="h-6 w-6"
//           >
//             <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
//             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
//           </svg>
//           Template Details
//         </h2>
//         <button
//           onClick={() => setViewTemplate(null)}
//           className="text-gray-500 hover:text-gray-700 text-xl"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Template Info */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-800">
//         <div>
//           <strong>ID:</strong> {viewTemplate.id}
//         </div>
//         <div>
//           <strong>Name:</strong>{" "}
//           {viewTemplate.name || viewTemplate.template_name}
//         </div>
//         <div>
//           <strong>Status:</strong>{" "}
//           {viewTemplate.is_active ? "Active" : "Inactive"}
//         </div>
//         <div>
//           <strong>Created At:</strong>{" "}
//           {viewTemplate.created_at
//             ? formatDateTime(viewTemplate.created_at)
//             : "N/A"}
//         </div>
//       </div>

//       {/* Stages Section */}
//       <div className="pt-4">
//         <h3 className="text-lg font-semibold border-b pb-1 mb-2">Stages</h3>
//         {Array.isArray(viewTemplate.steps) &&
//         viewTemplate.steps.length > 0 ? (
//           <div className="space-y-3">
//             {viewTemplate.steps.map((s, i) => (
//               <div
//                 key={i}
//                 className="border rounded-md p-3 bg-gray-50 shadow-sm"
//               >
//                 <p>
//                   <strong>Stage {i + 1} Name:</strong> {s.name}
//                 </p>
//                 <p>
//                   <strong>Description:</strong>{" "}
//                   {s.description || "-"}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="mt-1 text-gray-600">No stages added</p>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="flex justify-end pt-4 border-t">
//         <button
//           onClick={() => setViewTemplate(null)}
//           className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}
