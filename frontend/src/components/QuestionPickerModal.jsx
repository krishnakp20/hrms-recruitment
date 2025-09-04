import { useEffect, useState } from "react";
import { X, Check, Search } from "lucide-react";
import { jobsAPI } from "../services/api";

export default function QuestionPickerModal({ isOpen, job, onClose, onAttached }) {
  const [roundType, setRoundType] = useState("HR");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [bank, setBank] = useState([]);
  const [checked, setChecked] = useState({});
  const [weights, setWeights] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    loadBank();
  }, [isOpen, roundType, search]);

  const loadBank = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getBankQuestions({ round_type: roundType, search });
      setBank(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const changeWeight = (id, val) =>
    setWeights((p) => ({ ...p, [id]: parseFloat(val) || 1 }));

  const attachSelected = async () => {
    const items = Object.entries(checked)
      .filter(([id, on]) => on)
      .map(([id]) => ({
        bank_question_id: Number(id),
        weight: weights[id],
      }));

    if (!items.length) return;
    await jobsAPI.attachQuestionsToJob(job.id, items);
    onAttached?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Pick Questions for {job?.position_title}</h2>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
            className="border rounded-lg p-2 flex-1"
          >
            <option value="HR">HR Round</option>
            <option value="Manager">Manager Round</option>
            <option value="Executive">Executive Round</option>
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
            <input
              placeholder="Search by text / competency"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg p-2 pl-8"
            />
          </div>
        </div>

        {/* Questions Table */}
        <div className="max-h-96 overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 w-10"></th>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Competency</th>
                <th className="px-4 py-2 text-left">Expected Points</th>
                <th className="px-4 py-2 text-left w-28">Weight</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : bank.length ? (
                bank.map((q, i) => (
                  <tr
                    key={q.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={!!checked[q.id]}
                        onChange={() => toggle(q.id)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-2">{q.text}</td>
                    <td className="px-4 py-2">{q.competency || "-"}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {(q.expected_points || []).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className="border rounded-md p-1 w-20"
                        value={weights[q.id] ?? q.default_weight ?? 1}
                        onChange={(e) => changeWeight(q.id, e.target.value)}
                        disabled={!checked[q.id]}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No questions in bank for this round.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2 shadow hover:bg-blue-700"
            onClick={attachSelected}
          >
            <Check size={18} /> Attach Selected
          </button>
        </div>
      </div>
    </div>
  );
}
