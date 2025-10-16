import { useState, useEffect } from "react";
import api from "../services/api"; // axios instance
import CreateInterviewQuestionForm from "../components/CreateInterviewQuestionForm";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const itemsPerPage = 10;

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/interview-questions/");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/interview-questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSuccess = (newQuestion) => {
    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === newQuestion.id ? newQuestion : q))
      );
    } else {
      setQuestions((prev) => [newQuestion, ...prev]);
    }
    setShowForm(false);
  };

  // Filter questions by search term
  const filteredQuestions = questions.filter(
    (q) =>
      (q.question_text || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const currentItems = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Interview Questions
          </h1>
          <p className="text-gray-600">Manage interview questions per job/round</p>
        </div>
        <button className="btn-primary flex items-center" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                S.No
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                Round
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                Question
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                Max Score
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                Weight
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : currentItems.length ? (
              currentItems.map((q, index) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">{q.round?.name || "-"}</td>
                  <td className="px-6 py-4">{q.question_text}</td>
                  <td className="px-6 py-4">{q.max_score}</td>
                  <td className="px-6 py-4">{q.weightage}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleEdit(q)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No questions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingQuestion ? "Edit Question" : "Create Question"}
            </h2>
            <CreateInterviewQuestionForm
              onCreated={handleFormSuccess}
              initialData={editingQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
}
