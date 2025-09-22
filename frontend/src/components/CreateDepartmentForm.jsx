import { useState, useEffect } from "react";
import { departmentsAPI } from "../services/api";

const CreateDepartmentForm = ({ onCreated, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    sub_department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Pre-fill if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sub_department: initialData.sub_department || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        // ✅ Update
        await departmentsAPI.updateDepartment(initialData.id, formData);
      } else {
        // ✅ Create
        await departmentsAPI.createDepartment(formData);
      }
      onCreated(); // notify parent
    } catch (err) {
      console.error("Failed to save department", err);
      setError("Failed to save department. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Department Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Department Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input-field mt-1 w-full"
          placeholder="Enter department name"
        />
      </div>

      {/* Sub Department */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sub Department
        </label>
        <input
          type="text"
          name="sub_department"
          value={formData.sub_department}
          onChange={handleChange}
          className="input-field mt-1 w-full"
          placeholder="Enter sub department (optional)"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Saving..." : initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default CreateDepartmentForm;
