import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jobsAPI, interviewsAPI } from "../services/api";

const InterviewPage = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("HR"); // HR | Manager | COO
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [round, setRound] = useState(null);

  // Fetch application + job info
  const fetchApplication = async () => {
    try {
      const res = await interviewsAPI.getApplication(applicationId);
      setApplication(res.data);

      // Start interview if not started
      const iRes = await interviewsAPI.startInterview(applicationId);
      setInterview(iRes.data);

      // Fetch questions for job
      const qRes = await jobsAPI.getQuestionsBankByJob(res.data.job.id);
      setQuestions(qRes.data || []);
    } catch (err) {
      console.error("Failed to load interview data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  // Start round whenever activeTab changes
  useEffect(() => {
    const startRound = async () => {
      if (!interview) return;
      try {
        const rRes = await interviewsAPI.startRound(interview.id, {round_type: activeTab,});
        setRound(rRes.data);

        // Fetch questions for this round
      const qRes = await jobsAPI.getQuestionsBankByJob(application.job.id, activeTab);
      setQuestions(qRes.data || []);

        setAnswers({}); // reset answers for new round
      } catch (err) {
        console.error("Failed to start round", err);
      }
    };
    startRound();
  }, [interview, activeTab]);


  const handleChange = (qId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!round) return;
    try {
      const payload = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId, 10),
        score: parseFloat(ans.score) || 0,
        remarks: ans.remarks || "",
      }));

      const res = await interviewsAPI.submitRound(interview.id, activeTab, payload);
      setScore(res.data.score_pct); // backend returns score_pct
      alert("Interview round submitted successfully!");
    } catch (err) {
      console.error("Failed to submit interview", err);
      alert("Error submitting interview");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Candidate + Job Info */}
      <div className="card p-4">
        <h2 className="text-xl font-bold text-gray-900">
          Interview: {application.candidate.first_name}{" "}
          {application.candidate.last_name}
        </h2>
        <p className="text-sm text-gray-600">
          Job: {application.job.position_title} ({application.job.position_code})
        </p>
        <p className="text-sm text-gray-600">Email: {application.candidate.email}</p>
        <p className="text-sm text-gray-600">
          Experience: {application.candidate.experience_years} years
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {["HR", "Manager", "Executive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} Round
          </button>
        ))}
      </div>

      {/* Questions Form */}
      <div className="card p-4 space-y-4">
        {questions.length === 0 ? (
          <p>No questions found for this job.</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <p className="font-medium">{q.text}</p>
              <p className="font-medium">Weightage: {q.weight}</p>
              <input
                type="number"
                placeholder="Score (0-10)"
                value={answers[q.id]?.score || ""}
                onChange={(e) => handleChange(q.id, "score", e.target.value)}
                className="input-field w-32"
              />
              <textarea
                placeholder="Remarks"
                value={answers[q.id]?.remarks || ""}
                onChange={(e) => handleChange(q.id, "remarks", e.target.value)}
                className="input-field w-full"
              />
            </div>
          ))
        )}

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Submit {activeTab} Round
        </button>
      </div>

      {/* Suitability Score */}
      {score !== null && (
        <div className="card p-4 text-center">
          <h3 className="text-lg font-bold">Suitability Score</h3>
          <p className="text-2xl text-indigo-600 font-bold">{score}%</p>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
