// import { useState, useEffect } from "react";
// import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
// import { workflowTemplateAPI } from "../services/api";

// const RecruitmentWorkflowTemplates = () => {
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     status: "active",
//     template_name: "",
//     stages: [],
//     status: true,
//   });
//   const [stageInput, setStageInput] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editingIndex, setEditingIndex] = useState(null); //
//   const [viewTemplate, setViewTemplate] = useState(null);
//   const [successModal, setSuccessModal] = useState({
//     show: false,
//     message: "",
//   });

//   // Fetch all templates
//   const fetchTemplates = async () => {
//     try {
//       setLoading(true);
//       const res = await workflowTemplateAPI.getAll();
//       setTemplates(res.data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch workflow templates");
//       setTemplates([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   useEffect(() => {
//     if (successModal.show) {
//       const timer = setTimeout(() => {
//         setSuccessModal({ show: false, message: "" });
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [successModal.show]);

//   // Submit form
//   //   const handleSubmit = async (e) => {
//   //     e.preventDefault();
//   //     try {
//   //       if (editingId) {
//   //         await workflowTemplateAPI.update(editingId, form);
//   //         setSuccessModal({
//   //           show: true,
//   //           message: "Template updated successfully!",
//   //         });
//   //       } else {
//   //         await workflowTemplateAPI.create(form);
//   //         setSuccessModal({
//   //           show: true,
//   //           message: "Template created successfully!",
//   //         });
//   //       }
//   //       resetForm();
//   //       fetchTemplates();
//   //     } catch (err) {
//   //       console.error(err);
//   //       setError("Failed to save template");
//   //     }
//   //   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // convert fields to backend-compatible format
//       const payload = {
//         template_name: form.template_name,
//         stages: form.stages,
//         status: form.status === "active" ? "Active" : "Inactive",
//         // status: form.status === "active",
//       };

//       console.log("Submitting payload:", payload);

//       if (editingId) {
//         await workflowTemplateAPI.update(editingId, payload);
//         setSuccessModal({
//           show: true,
//           message: "Template updated successfully!",
//         });
//       } else {
//         await workflowTemplateAPI.create(payload);
//         setSuccessModal({
//           show: true,
//           message: "Template created successfully!",
//         });
//       }

//       resetForm();
//       fetchTemplates();
//     } catch (err) {
//       console.error("Error submitting template:", err.response?.data || err);
//       setError("Failed to save template");
//     }
//   };

//   const resetForm = () => {
//     // setForm({ template_name: "", stages: [], status: true });
//     setForm({ template_name: "", stages: [], status: "active" }); // 👈 string
//     setStageInput("");
//     setEditingId(null);
//     setShowForm(false);
//   };

//   const handleEdit = (template) => {
//     setForm({
//       template_name: template.template_name,
//       stages: template.stages,
//       status: template.status,
//     });
//     setEditingId(template.id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this template?"))
//       return;
//     try {
//       await workflowTemplateAPI.delete(id);
//       fetchTemplates();
//       setSuccessModal({
//         show: true,
//         message: "Template deleted successfully!",
//       });
//     } catch (err) {
//       console.error(err);
//       setError("Failed to delete template");
//     }
//   };

//   // Filter by search
//   const filteredTemplates = templates.filter((t) =>
//     t.template_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Recruitment Workflow Templates
//         </h1>
//         <button
//           className="btn-primary flex items-center"
//           onClick={() => setShowForm(true)}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Add Template
//         </button>
//       </div>

//       {/* Search */}
//       <div className="card">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search templates..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="input-field pl-10"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="card overflow-x-auto">
//         {loading ? (
//           <p className="p-4">Loading...</p>
//         ) : (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Template Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Stages
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                   Created At
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredTemplates.map((t) => (
//                 <tr key={t.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">{t.template_name}</td>
//                   <td className="px-6 py-4">
//                     {t.stages && t.stages.join(", ")}
//                   </td>
//                   <td className="px-6 py-4">
//                     {t.status ? "Active" : "Inactive"}
//                   </td>
//                   <td className="px-6 py-4">
//                     {new Date(t.created_at).toLocaleDateString("en-GB")}
//                   </td>
//                   <td className="px-6 py-4 text-right space-x-3">
//                     <button
//                       className="text-blue-600 hover:text-blue-900"
//                       onClick={() => setViewTemplate(t)}
//                     >
//                       <Eye className="h-4 w-4" />
//                     </button>
//                     <button
//                       className="text-gray-600 hover:text-gray-900"
//                       onClick={() => handleEdit(t)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </button>
//                     <button
//                       className="text-red-600 hover:text-red-900"
//                       onClick={() => handleDelete(t.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredTemplates.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="text-center text-gray-500 py-6">
//                     No templates found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Modal Form */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
//             <button
//               onClick={resetForm}
//               className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
//             >
//               ✕
//             </button>
//             <h2 className="text-xl font-semibold mb-4">
//               {editingId ? "Edit Template" : "Add Template"}
//             </h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 type="text"
//                 placeholder="Template Name"
//                 value={form.template_name}
//                 onChange={(e) =>
//                   setForm({ ...form, template_name: e.target.value })
//                 }
//                 className="input-field w-full"
//                 required
//               />
//               {/* Stages Input */}
//               <div>
//                 {/* Input for adding or editing a stage */}
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     placeholder="Add stage..."
//                     value={stageInput}
//                     onChange={(e) => setStageInput(e.target.value)}
//                     className="input-field flex-1"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (stageInput.trim()) {
//                         if (editingIndex !== null) {
//                           // Update existing stage
//                           const updatedStages = [...form.stages];
//                           updatedStages[editingIndex] = stageInput.trim();
//                           setForm({ ...form, stages: updatedStages });
//                           setEditingIndex(null);
//                         } else {
//                           // Add new stage
//                           setForm({
//                             ...form,
//                             stages: [...form.stages, stageInput.trim()],
//                           });
//                         }
//                         setStageInput("");
//                       }
//                     }}
//                     className="btn-primary px-3"
//                   >
//                     {editingIndex !== null ? "Update" : "Add"}
//                   </button>
//                 </div>

//                 {/* List of stages */}
//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {form.stages.map((s, i) => (
//                     <span
//                       key={i}
//                       className="px-2 py-1 bg-gray-200 rounded-md text-sm flex items-center gap-2"
//                     >
//                       {s}
//                       <button
//                         type="button"
//                         className="text-blue-500 text-xs"
//                         onClick={() => {
//                           setStageInput(s); // load value into input
//                           setEditingIndex(i); // set index for editing
//                         }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="text-red-500 text-xs"
//                         onClick={() => {
//                           const updatedStages = form.stages.filter(
//                             (_, idx) => idx !== i
//                           );
//                           setForm({ ...form, stages: updatedStages });
//                         }}
//                       >
//                         ✕
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* Status */}
//               {/* <label className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={form.status}
//                   onChange={(e) =>
//                     setForm({ ...form, status: e.target.checked })
//                   }
//                 />
//                 Active
//               </label> */}
//               <label className="flex flex-col gap-2">
//                 <span>Status</span>
//                 <select
//                   value={form.status ? "active" : "inactive"} // ✅ maps boolean to string
//                   onChange={
//                     (e) =>
//                       setForm({ ...form, status: e.target.value === "active" }) // ✅ maps string back to boolean
//                   }
//                   className="border rounded p-2"
//                 >
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </label>

//               <div className="flex justify-end gap-2">
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="px-4 py-2 border rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn-primary px-4 py-2">
//                   {editingId ? "Update" : "Create"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* View Modal */}
//       {viewTemplate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
//             <button
//               onClick={() => setViewTemplate(null)}
//               className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
//             >
//               ✕
//             </button>
//             <h2 className="text-xl font-semibold mb-4">Template Details</h2>
//             <p>
//               <strong>ID:</strong> {viewTemplate.id}
//             </p>
//             <p>
//               <strong>Name:</strong> {viewTemplate.template_name}
//             </p>
//             <p>
//               <strong>Stages:</strong> {viewTemplate.stages.join(", ")}
//             </p>
//             <p>
//               <strong>Status:</strong>{" "}
//               {viewTemplate.status ? "Active" : "Inactive"}
//             </p>
//             <p>
//               <strong>Created At:</strong>{" "}
//               {new Date(viewTemplate.created_at).toLocaleString()}
//             </p>
//             <div className="flex justify-end mt-6">
//               <button
//                 onClick={() => setViewTemplate(null)}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {successModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
//             <h2 className="text-lg font-semibold text-green-600 mb-4">
//               {successModal.message}
//             </h2>
//             <button
//               onClick={() => setSuccessModal({ show: false, message: "" })}
//               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//             >
//               OK
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RecruitmentWorkflowTemplates;

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
        <h1 className="text-2xl font-bold text-gray-900">
          Recruitment Workflow
        </h1>
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
                  <td className="px-6 py-4">{t.name}</td>
                  <td className="px-6 py-4">
                    {Array.isArray(t.steps) ? t.steps.length : 0}
                  </td>

                  <td className="px-6 py-4">
                    {t.is_active ? "Active" : "Inactive"}
                  </td>

                  <td className="px-6 py-4">{formatDate(t.created_at)}</td>
                  <td className="px-6 py-4 text-right space-x-3">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
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
                    className="bg-orange-500 text-white px-4 py-2 rounded"
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
                  className="bg-orange-500 text-white px-4 py-2 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            {/* Close Button */}
            <button
              onClick={() => setViewTemplate(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Template Details</h2>

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
