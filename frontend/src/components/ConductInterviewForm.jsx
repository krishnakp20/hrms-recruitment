import { useState, useEffect } from "react";
import api from "../services/api";
import { Save } from "lucide-react";

export default function ConductInterviewForm({ sessionId, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [overallScore, setOverallScore] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch questions based on the round of this session
  useEffect(() => {
    const fetchSessionAndQuestions = async () => {
      try {
        const sessionRes = await api.get(`/interview-sessions/${sessionId}`);
        const session = sessionRes.data;

        // Fetch all questions for this round
        const qRes = await api.get(`/interview-questions/job/${session.job_id}/round/${session.round_id}`);
        const questionList = qRes.data;

        setQuestions(questionList);

        // Initialize responses
        setResponses(
          questionList.map((q) => ({
            question_id: q.id,
            score: "",
            feedback: "",
          }))
        );
      } catch (err) {
        console.error("Error loading interview session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndQuestions();
  }, [sessionId]);

  const handleChange = (index, field, value) => {
    setResponses((prev) => {
      const newResponses = [...prev];
      newResponses[index][field] = value;
      return newResponses;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/interview-sessions/conduct", {
        session_id: sessionId,
        responses: responses.map((r) => ({
          ...r,
          score: Number(r.score),
        })),
        overall_feedback: overallFeedback,
        overall_score: Number(overallScore),
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to submit interview!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading interview questions...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conduct Interview</h1>
        <p className="text-gray-600">Fill in scores and feedback for this session</p>
      </div>

      <form onSubmit={handleSubmit}>
          <div className="card overflow-x-auto overflow-y-auto max-h-[80vh]">
            {questions.length === 0 ? (
              <p>No questions found for this round.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((q, i) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{i + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{q.question_text}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{q.max_score}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{q.weightage}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={q.max_score}
                          value={responses[i]?.score || ""}
                          onChange={(e) => handleChange(i, "score", e.target.value)}
                          className="input-field w-20"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          value={responses[i]?.feedback || ""}
                          onChange={(e) => handleChange(i, "feedback", e.target.value)}
                          className="input-field w-full"
                          placeholder="Enter feedback..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Overall Evaluation</h3>
              <textarea
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                className="input-field w-full mb-3"
                placeholder="Overall feedback..."
              />
              <input
                type="number"
                step="0.5"
                value={overallScore}
                onChange={(e) => setOverallScore(e.target.value)}
                placeholder="Overall Score"
                className="input-field w-40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Interview"}
            </button>
          </div>
      </form>
    </div>
  );
}
