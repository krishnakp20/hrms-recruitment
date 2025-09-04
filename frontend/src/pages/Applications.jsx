import { useState, useEffect } from 'react'
import { Search, Eye, Edit, Trash2 } from 'lucide-react'
import { applicationsAPI } from '../services/api'  // ✅ new API service
import { useNavigate } from 'react-router-dom'

const Applications = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  const statuses = ['all', 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired']

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

  const filteredApplications = applications.filter(application => {
    const matchesSearch =
      application.candidate.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || application.status === selectedStatus
    return matchesSearch && matchesStatus
  })

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
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Position</th>
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
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">No applications found.</td>
              </tr>
            ) : (
              filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{application.candidate.first_name} {application.candidate.last_name}</div>
                    <div className="text-sm text-gray-500">{application.candidate.email}</div>
                    <div className="text-sm text-gray-500">{application.candidate.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{application.job.position_title}</div>
                    <div className="text-sm text-gray-500">{application.job.experience_level} experience</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{application.job.department.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                          onClick={() => navigate(`/interviews/${application.id}`)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded"
                        >
                          Start Interview
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Applications
