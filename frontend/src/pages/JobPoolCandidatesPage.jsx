import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { jobsAPI } from '../services/api'

const JobPoolCandidatesPage = () => {
  const { jobId } = useParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPoolCandidates = async () => {
    setLoading(true)
    try {
      const res = await jobsAPI.getPoolForJob(jobId) // ✅ same as your working code
      setCandidates(res.data || [])
    } catch (err) {
      console.error('Failed to fetch pool candidates', err)
      setCandidates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (jobId) fetchPoolCandidates()
  }, [jobId])

  const filteredCandidates = candidates.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Shortlisted': return 'bg-yellow-100 text-yellow-800'
      case 'Interviewed': return 'bg-purple-100 text-purple-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Hired': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pool Candidates</h1>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-6">Loading...</td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6">No matched candidates in the pool.</td>
              </tr>
            ) : (
              filteredCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td className="px-6 py-4">{candidate.first_name} {candidate.last_name}</td>
                  <td className="px-6 py-4">{candidate.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.location_city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience_years} years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.cover_letter}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                      {candidate.status || 'N/A'}
                    </span>
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

export default JobPoolCandidatesPage
