import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Login from "./pages/Login";
import JobPoolCandidatesPage from "./pages/JobPoolCandidatesPage";
import Careers from "./pages/Careers";
import RecruitmentAgencies from "./pages/RecruitmentAgencies";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import RecruitmentWorkflow from "./pages/RecruitmentWorkflow";
import InterviewRound from './pages/InterviewRound'
import InterviewPage from './pages/InterviewPage'
import BankQuestionsPage from './pages/BankQuestionsPage'
import CandidateOffers from './pages/CandidateOffers'
import RecruitmentUser from "./pages/RecruitmentUser";
import DepartmentPage from "./pages/DepartmentPage";
import InterviewQuestionsPage from "./pages/InterviewQuestionsPage";
import InterviewConductPage from "./pages/InterviewConductPage";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/careers" element={<Careers />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="applications" element={<Applications />} />
            <Route
              path="/jobs/:jobId/pool-candidates"
              element={<JobPoolCandidatesPage />}
            />
            <Route path="recruitment-agencies" element={<RecruitmentAgencies />} />{" "}
            {/* <-- Added */}
            <Route
              path="candidate-profile"
              element={<CandidateProfilePage />}
            />
            <Route
              path="recruitment-workflow"
              element={<RecruitmentWorkflow />}
            />
            <Route path="interview/:interviewId/:roundType" element={<InterviewRound />} />
            <Route path="interviews/:applicationId" element={<InterviewPage />} />
            <Route path="/bank-questions/create" element={<BankQuestionsPage />} />
            <Route path="/offers" element={<CandidateOffers />} />
            <Route path="/users" element={<RecruitmentUser />} />
            <Route path="/department" element={<DepartmentPage />} />
            <Route path="/interview/questions" element={<InterviewQuestionsPage />} />
            <Route path="/interviews/session/:sessionId" element={<InterviewConductPage />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
