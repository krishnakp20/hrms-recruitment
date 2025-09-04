// src/components/CreateBankQuestionForm.jsx
import React, { useState, useEffect } from "react";
import { jobsAPI } from "../services/api";

const CreateBankQuestionForm = ({ onCreated, initialData }) => {
  const [formData, setFormData] = useState({
    round_type: "HR",
    text: "",
    competency: "",
    expected_points: "",
    default_weight: 1.0,
  });

  const [loading, setLoading] = useState(false);

  // Pre-fill data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        round_type: initialData.round_type || "HR",
        text: initialData.text || "",
        competency: initialData.competency || "",
        expected_points: (initialData.expected_points || []).join(", "),
        default_weight: initialData.default_weight ?? 1.0,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      round_type: formData.round_type,
      text: formData.text,
      competency: formData.competency || null,
      expected_points: formData.expected_points
        ? formData.expected_points.split(",").map((s) => s.trim())
        : [],
      default_weight: parseFloat(formData.default_weight) || 1.0,
    };

    try {
      if (initialData) {
        // Editing existing
        await jobsAPI.updateBankQuestion(initialData.id, payload);
      } else {
        // Creating new
        await jobsAPI.createBankQuestion(payload);
      }

      if (onCreated) onCreated();

      if (!initialData) {
        // Reset only for new create
        setFormData({
          round_type: "HR",
          text: "",
          competency: "",
          expected_points: "",
          default_weight: 1.0,
        });
      }
    } catch (err) {
      console.error("Failed to save bank question", err);
      alert("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow space-y-6"
    >
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium mb-1">Question Text</label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring focus:ring-blue-200"
          rows="3"
          placeholder="Enter your question..."
          required
        />
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Round Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Round Type</label>
          <select
            name="round_type"
            value={formData.round_type}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            required
          >
            <option value="HR">HR</option>
            <option value="Manager">Manager</option>
            <option value="Executive">Executive</option>
          </select>
        </div>

        {/* Competency */}
        <div>
          <label className="block text-sm font-medium mb-1">Competency</label>
          <input
            type="text"
            name="competency"
            value={formData.competency}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            placeholder="e.g. Communication, Leadership"
          />
        </div>

        {/* Expected Points */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Expected Points
          </label>
          <input
            type="text"
            name="expected_points"
            value={formData.expected_points}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            placeholder="Comma separated (e.g. Clear answers, Confidence)"
          />
        </div>

        {/* Default Weight */}
        <div>
          <label className="block text-sm font-medium mb-1">Default Weight</label>
          <input
            type="number"
            step="0.1"
            name="default_weight"
            value={formData.default_weight}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
            min="0.1"
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl shadow-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : initialData
          ? "Update Question"
          : "Save Question to Bank"}
      </button>
    </form>
  );
};

export default CreateBankQuestionForm;
