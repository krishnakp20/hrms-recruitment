import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { recruitmentAgencyAPI } from "../services/api";

const RecruitmentAgencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [viewAgency, setViewAgency] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Validation helper
  const validateForm = () => {
    const errors = {};

    // At least one required
    if (!form.email && !form.phone) {
      errors.general = "Either Email or Phone is required.";
    }

    // Email validation
    if (form.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.email = "Invalid email format.";
      }
    }

    // Phone validation (only digits, 10 digits max)
    if (form.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(form.phone)) {
        errors.phone = "Phone must be 10 digits.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // ✅ valid if no errors
  };
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  }); // ✅ success modal state

  // Fetch agencies
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const res = await recruitmentAgencyAPI.getAll();
      setAgencies(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch agencies");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    if (successModal.show) {
      const timer = setTimeout(() => {
        setSuccessModal({ show: false, message: "" });
      }, 4000); // 👈 4 seconds instead of 2
      return () => clearTimeout(timer);
    }
  }, [successModal.show]);

  // Filtered agencies
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = agency.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    agency.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" ? agency.is_active : !agency.is_active);
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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // stop submit if errors
    try {
      if (editingId) {
        await recruitmentAgencyAPI.update(editingId, form);
        setSuccessModal({
          show: true,
          message: "Agency updated successfully!",
        });
      } else {
        await recruitmentAgencyAPI.create(form);
        setSuccessModal({
          show: true,
          message: "Agency created successfully!",
        });
      }
      // setForm({ name: "", status: "active" });
      resetForm();
      setEditingId(null);
      setShowForm(false);
      fetchAgencies();
    } catch (err) {
      console.error(err);
      setError("Failed to save agency");
    }
  };

  // const handleEdit = (agency) => {
  //   setForm({ agency });
  //   setEditingId(agency.id);
  //   setShowForm(true);
  // };

  const handleEdit = (agency) => {
    setForm({
      id: agency.id,
      name: agency.name || "",
      contact_person: agency.contact_person || "",
      email: agency.email || "",
      phone: agency.phone || "",
      website: agency.website || "",
      is_active: agency.is_active,
    });
    setEditingId(agency.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agency?")) return;
    try {
      await recruitmentAgencyAPI.delete(id);
      fetchAgencies();
      setSuccessModal({ show: true, message: "Agency deleted successfully!" });
    } catch (err) {
      console.error(err);
      setError("Failed to delete agency");
    }
  };

  // ✅ handle true/false from DB
  const getStatusColor = (isActive) => {
    if (isActive === true) {
      return "bg-green-100 text-green-800"; // Active
    } else if (isActive === false) {
      return "bg-red-100 text-red-800"; // Inactive
    }
    return "bg-gray-100 text-gray-800"; // Default / null
  };

  // const resetForm = () => {
  //   setForm({
  //     name: "",
  //     contact_person: "",
  //     email: "",
  //     phone: "",
  //     website: "",
  //     is_active: true,
  //   });
  //   setEditingId(null);
  //   setShowForm(false);
  // };

  const resetForm = () => {
    setForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      website: "",
      is_active: true,
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAgencies.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentAgencies = filteredAgencies.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recruitment Agencies
          </h1>
          <p className="text-gray-600">Manage external recruitment agencies</p>
        </div>
        <button
          className="btn-primary flex items-center"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Agency
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
                placeholder="Search agencies..."
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

      {/* Agencies Table */}
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAgencies.length > 0 ? (
                currentAgencies.map((agency, index) => (
                  <tr key={agency.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agency.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          agency.is_active
                        )}`}
                      >
                        {agency.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(agency.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => setViewAgency(agency)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEdit(agency)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(agency.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No agencies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls */}
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

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Agency" : "Add Agency"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First row */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Agency Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={form.contact_person}
                  onChange={(e) =>
                    setForm({ ...form, contact_person: e.target.value })
                  }
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email field */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="input-field w-full"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone field */}
                <div>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // remove non-digits
                      if (value.length <= 10) {
                        setForm({ ...form, phone: value });
                      }
                    }}
                    className="input-field w-full"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-2">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* {formErrors.general && (
                <p className="text-red-500 text-sm">{formErrors.general}</p>
              )} */}

              {/* Third row */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Website"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  className="input-field w-full"
                />
                <select
                  name="is_active"
                  value={form.is_active ? "active" : "inactive"} // convert boolean -> string for UI
                  onChange={
                    (e) =>
                      setForm({
                        ...form,
                        is_active: e.target.value === "active",
                      }) // convert string -> boolean
                  }
                  className="input-field w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
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
      {viewAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl space-y-4 max-h-[70vh] p-6 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold mb-4">Agency Details</h2>

              {/* Close button (top-right inside modal) */}
              <button
                onClick={() => setViewAgency(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <p>
              <strong>ID:</strong> {viewAgency.id}
            </p>
            <p>
              <strong>Name:</strong> {viewAgency.name}
            </p>
            <p>
              <strong>Contact Person:</strong>{" "}
              {viewAgency.contact_person || "-"}
            </p>
            <p>
              <strong>Email:</strong> {viewAgency.email || "-"}
            </p>
            <p>
              <strong>Phone:</strong> {viewAgency.phone || "-"}
            </p>
            <p>
              <strong>Website:</strong> {viewAgency.website || "-"}
            </p>
            {/* <p>
              <strong>Status:</strong> {viewAgency.status}
            </p> */}
            <p>
              <strong>Status:</strong>{" "}
              {viewAgency.is_active
                ? "Active"
                : "Inactive".charAt(0).toUpperCase() + viewAgency.is_active
                ? "Active"
                : "Inactive".slice(1)}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {formatDateTime(viewAgency.created_at)}
              {/* {new Date(viewAgency.created_date).toLocaleString()} */}
            </p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewAgency(null)}
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

export default RecruitmentAgencies;
