import { useState, useEffect } from 'react'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { applicationsAPI } from '../services/api'  // ✅ new API service
import { useNavigate } from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Applications = () => {
  const navigate = useNavigate()
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)

  const statuses = ['all', 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired']

  const [openRoundPickerFor, setOpenRoundPickerFor] = useState(null); // tracks which application row opened the dropdown
  const [roundOptions, setRoundOptions] = useState([]); // stores rounds fetched from API
  const [selectedRounds, setSelectedRounds] = useState({}); // remembers last selected round per job


  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800'
      case 'Shortlisted': return 'bg-yellow-100 text-yellow-800'
      case 'Interviewed': return 'bg-purple-100 text-purple-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Hired': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await applicationsAPI.getAll()  // ✅ backend call
      setApplications(res.data || [])
    } catch (err) {
      console.error('Failed to fetch applications', err)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])



  const handleStartInterview = async (application) => {
    try {
      // Get round_id dynamically for the given job/application
      const roundRes = await api.get(`/interview-rounds/job/${application.job.id}`);
      const rounds = roundRes.data;

      if (!rounds.length) {
        alert("No interview rounds found for this job.");
        return;
      }

      // You can either auto-select the first round or ask the user to pick
      const roundId = rounds[0].id; // For now, take the first round

      const interviewerId = user?.id; // From AuthContext

      if (!interviewerId) {
        alert("Unable to identify interviewer. Please log in again.");
        return;
      }

      // Start or fetch the interview session
      const res = await api.post("/interview-sessions/start", {
        application_id: application.id,
        round_id: roundId,
        interviewer_id: interviewerId,
      });

      // Navigate to the interview page for this session
      navigate(`/interviews/session/${res.data.id}`);
    } catch (err) {
      console.error("Error starting interview:", err);
      alert("Failed to start interview session");
    }
  };


  const handleOpenRoundPicker = async (application) => {
      try {
        const res = await api.get(`/interview-rounds/job/${application.job.id}`);
        const rounds = res.data;

        if (!rounds.length) {
          alert("No interview rounds found for this job.");
          return;
        }

        setRoundOptions(rounds);
        setOpenRoundPickerFor(application.id);

        // Pre-select the last chosen round or default to the first
        setSelectedRounds((prev) => ({
          ...prev,
          [application.id]: prev[application.id] || rounds[0].id,
        }));
      } catch (err) {
        console.error("Error fetching rounds:", err);
        alert("Failed to fetch interview rounds");
      }
  };



  const filteredApplications = applications.filter(application => {
    const matchesSearch =
      application.candidate.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || application.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // ✅ Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredApplications.slice(indexOfFirstRow, indexOfLastRow)

  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">Manage job applications and candidates</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto overflow-y-auto max-h-[70vh]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center py-6">Loading...</td>
            </tr>
          ) : currentRows.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6">No applications found.</td>
            </tr>
          ) : (
            currentRows.map((application, index) => (
              <tr key={application.id} className="hover:bg-gray-50">
                {/* ✅ Serial number */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{application.job.position_title}</div>
                  <div className="text-sm text-gray-500">{application.job.experience_level} experience</div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {application.candidate.first_name} {application.candidate.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{application.candidate.email}</div>
                  <div className="text-sm text-gray-500">{application.candidate.phone}</div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  {application.job.department.name}
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2 relative">
                    {openRoundPickerFor === application.id ? (
                      <div className="flex gap-2 items-center">
                        <select
                          className="input-field"
                          value={selectedRounds[application.id] || ""}
                          onChange={(e) =>
                            setSelectedRounds((prev) => ({
                              ...prev,
                              [application.id]: e.target.value,
                            }))
                          }
                        >
                          {roundOptions.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>

                        <button
                          className="btn-primary px-2 py-1"
                          onClick={async () => {
                            const roundId = selectedRounds[application.id];
                            if (!roundId) return alert("Please select a round");

                            try {
                              const res = await api.post("/interview-sessions/start", {
                                application_id: application.id,
                                round_id: roundId,
                                interviewer_id: user.id,
                              });
                              navigate(`/interviews/session/${res.data.id}`);
                            } catch (err) {
                              console.error(err);
                              alert("Failed to start interview session");
                            } finally {
                              setOpenRoundPickerFor(null);
                            }
                          }}
                        >
                          Start
                        </button>

                        <button
                          className="btn-secondary px-2 py-1"
                          onClick={() => setOpenRoundPickerFor(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRoundPicker(application)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        Start Interview
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Pagination controls */}
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
      </div>
      </div>
    </div>
  )
}

export default Applications
