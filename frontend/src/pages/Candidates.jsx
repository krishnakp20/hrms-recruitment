import { useState, useEffect } from 'react'
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react'
import CandidateForm from '../components/CandidateForm'
import { candidatesAPI } from '../services/api'

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [candidates, setCandidates] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)

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

  const statuses = ['all', 'Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired']

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{candidate.first_name} {candidate.last_name}</h3>
                <p className="text-sm text-gray-600">{candidate.position || 'N/A'}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                {candidate.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {candidate.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {candidate.phone}
              </div>
              <div className="text-sm text-gray-600">
                Experience: {candidate.experience_years} years
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-900">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-900" onClick={() => handleEditClick(candidate)}>
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(candidate.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CandidateForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchCandidates}
        editCandidate={editCandidate}
      />
    </div>
  )
}

export default Candidates
