import { useState, useEffect } from "react";
import api from "../services/api";

export default function CreateInterviewQuestionForm({ onCreated, initialData }) {
  const [jobId, setJobId] = useState(initialData?.job_id || "");
  const [roundId, setRoundId] = useState(initialData?.round_id || "");
  const [questions, setQuestions] = useState(
    initialData
      ? [{ ...initialData }]
      : [{ question_text: "", max_score: 5, weightage: 1.0 }]
  );
  const [rounds, setRounds] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // Fetch rounds and jobs for dropdown
    const fetchData = async () => {
      const roundsRes = await api.get("/interview-rounds/");
      setRounds(roundsRes.data);
      const jobsRes = await api.get("/jobs/");
      setJobs(jobsRes.data);
    };
    fetchData();
  }, []);

  // Handle input change for a specific question
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Add a new empty question
  const addQuestion = () => {
    setQuestions([...questions, { question_text: "", max_score: 5, weightage: 1.0 }]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId || !roundId) return alert("Please select Job and Round");

    const payload = {
      job_id: jobId,
      round_id: roundId,
      questions: questions.map(q => ({
        question_text: q.question_text,
        max_score: q.max_score,
        weightage: q.weightage
      }))
    };


    try {
      let res;
      if (initialData) {
        // For editing a single question (optional)
        res = await api.put(`/interview-questions/${initialData.id}`, payload.questions[0]);
      } else {
        res = await api.post("/interview-questions/bulk-create", payload);
      }
      onCreated(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Job & Round Dropdown */}
      <div className="flex gap-4">
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="input-field flex-1"
        >
          <option value="">Select Job</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.position_title}
            </option>
          ))}
        </select>

        <select
          value={roundId}
          onChange={(e) => setRoundId(e.target.value)}
          className="input-field flex-1"
        >
          <option value="">Select Round</option>
          {rounds.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scrollable Questions Section */}
      <div className="max-h-[400px] overflow-y-auto space-y-2 border p-2 rounded">
        {questions.map((q, index) => (
          <div key={index} className="space-y-2 border p-4 rounded relative">
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-900"
              >
                ✕
              </button>
            )}
            <textarea
              value={q.question_text}
              onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="input-field w-full"
              required
            />
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Max Score</label>
                <input
                  type="number"
                  value={q.max_score}
                  onChange={(e) => handleQuestionChange(index, "max_score", Number(e.target.value))}
                  className="input-field"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Weight</label>
                <input
                  type="number"
                  value={q.weightage}
                  onChange={(e) => handleQuestionChange(index, "weightage", Number(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addQuestion} className="btn-secondary">
        + Add Another Question
      </button>

      <button type="submit" className="btn-primary">
        {initialData ? "Update" : "Create All Questions"}
      </button>
    </form>
  );
}
