import React, { useState } from "react";
import { X } from "lucide-react";
import { interviewsAPI } from "../services/api"; // adjust to your API service

const QuestionForm = ({ isOpen, jobId, onSuccess, onClose }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    round_type: "HR",
    text: "",
    competency: "",
    expected_points: "",
    weight: 1.0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await interviewsAPI.createQuestion(jobId, {
        round_type: formData.round_type,
        text: formData.text,
        competency: formData.competency || null,
        expected_points: formData.expected_points
          ? formData.expected_points.split(",").map((s) => s.trim())
          : [],
        weight: parseFloat(formData.weight) || 1.0,
      });

      if (onSuccess) onSuccess(); // reload questions list
      onClose(); // close modal
    } catch (err) {
      console.error("Failed to add question", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add Question</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Round Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Round Type
            </label>
            <select
              name="round_type"
              value={formData.round_type}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Question Text
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              rows="3"
              placeholder="Enter your question..."
              required
            />
          </div>

          {/* Competency */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Competency (Optional)
            </label>
            <input
              type="text"
              name="competency"
              value={formData.competency}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              placeholder="e.g. Communication, Problem Solving"
            />
          </div>

          {/* Expected Points */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Expected Points (comma separated)
            </label>
            <input
              type="text"
              name="expected_points"
              value={formData.expected_points}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              placeholder="e.g. Strong communication, Team player"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Weight
            </label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
              min="0.1"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Question"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
