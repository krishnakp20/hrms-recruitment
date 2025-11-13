import { useState } from "react";
import { interviewRoundTemplatesAPI } from "../services/api";

const CreateInterviewRoundTemplateForm = ({ onCreated, initialData }) => {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await interviewRoundTemplatesAPI.updateTemplate(initialData.id, form);
      } else {
        await interviewRoundTemplatesAPI.createTemplate(form);
      }
      onCreated();
    } catch (err) {
      console.error("Failed to save template", err);
      alert("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input-field"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Order</label>
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          className="input-field"
          min={1}
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : initialData ? "Update Round" : "Create Round"}
      </button>
    </form>
  );
};

export default CreateInterviewRoundTemplateForm;
