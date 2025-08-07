import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react'
import CandidateForm from '../components/CandidateForm'
import { candidatesAPI } from '../services/api'
import CandidateView from '../components/CandidateView'

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [candidates, setCandidates] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [viewCandidate, setViewCandidate] = useState(null)


  const fetchCandidates = async () => {
    try {
      const res = await candidatesAPI.getAll()
      setCandidates(res.data)
    } catch (err) {
      console.error('Failed to fetch candidates', err)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleAddClick = () => {
    setEditCandidate(null)
    setFormOpen(true)
  }

  const handleEditClick = (candidate) => {
    setEditCandidate(candidate)
    setFormOpen(true)
  }

  const handleDeleteClick = async (id) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        await candidatesAPI.delete(id)
        fetchCandidates()
      } catch (err) {
        console.error('Failed to delete candidate', err)
      }
    }
  }

  const handleViewClick = (candidate) => {
  setViewCandidate(candidate)
}


  const statuses = ['all', 'New', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired', 'Pool']

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800'
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'Interviewed':
        return 'bg-purple-100 text-purple-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Hired':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleResumeUpload = async (candidateId, file) => {
  if (!file) return
  const formData = new FormData()
  formData.append('resume_file', file)

  try {
    const res = await candidatesAPI.uploadResume(candidateId, formData)
    alert('Resume uploaded & parsed successfully!')
    fetchCandidates()  // refresh table
  } catch (err) {
    console.error('Resume upload failed', err)
    alert('Failed to upload resume')
  }
}


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage job candidates and applications</p>
        </div>
        <button className="btn-primary flex items-center" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
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

      <div className="card overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCandidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {candidate.first_name} {candidate.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.location_city}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience_years} years</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="text-primary-600 hover:text-primary-900" onClick={() => handleViewClick(candidate)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => handleEditClick(candidate)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(candidate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {/* 👇 Upload resume input */}
                    <label className="cursor-pointer text-blue-600 hover:text-blue-900">
                      📄
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleResumeUpload(candidate.id, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
      </div>


      <CandidateForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchCandidates}
        editCandidate={editCandidate}
      />
      <CandidateView
          isOpen={!!viewCandidate}
          candidate={viewCandidate}
          onClose={() => setViewCandidate(null)}
      />

    </div>
  )
}

export default Candidates
