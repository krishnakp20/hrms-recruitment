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
import ExternalAgencies from "./pages/ExternalAgencies";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import RecruitmentWorkflow from "./pages/RecruitmentWorkflow";

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
            <Route path="external-agencies" element={<ExternalAgencies />} />{" "}
            {/* <-- Added */}
            <Route
              path="candidate-profile"
              element={<CandidateProfilePage />}
            />
            <Route
              path="recruitment-workflow"
              element={<RecruitmentWorkflow />}
            />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
