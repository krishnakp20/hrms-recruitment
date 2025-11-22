import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react'
import CandidateForm from '../components/CandidateForm'
import { candidatesAPI } from '../services/api'
import CandidateView from '../components/CandidateView'
import CandidateActions from '../components/CandidateActions'
import { useAuth } from '../contexts/AuthContext';

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [candidates, setCandidates] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [viewCandidate, setViewCandidate] = useState(null)
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGender, setSelectedGender] = useState('all')
  const [selectedEducation, setSelectedEducation] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc');
  const { user } = useAuth();
  const userRole = user?.role;

  const candidatesPerPage = 10;


  const experienceOptions = [
      { label: 'All Experience', value: 'all' },
      { label: '0-1 years', value: '0-1' },
      { label: '2-4 years', value: '2-4' },
      { label: '5+ years', value: '5+' }
  ]

  const fetchCandidates = async () => {
    try {
      const res = await candidatesAPI.getAll()
      setCandidates(res.data)
    } catch (err) {
      console.error('Failed to fetch candidates', err)
    }
  }

  const cityOptions = useMemo(() => {
      return ['all', ...Array.from(new Set(candidates.map(c => c.location_city?.trim()).filter(Boolean)))]
  }, [candidates])

  const skillOptions = useMemo(() => {
      const skills = candidates.flatMap(c =>
        c.cover_letter
          ? c.cover_letter.split(',').map(s => s.trim())
          : []
      )
      return ['all', ...Array.from(new Set(skills.filter(Boolean)))]
  }, [candidates])

  const genderOptions = ['all', 'Male', 'Female', 'Other']

  const educationOptions = useMemo(() => {
      return ['all', ...Array.from(new Set(candidates.map(c => c.education_qualification_short?.trim()).filter(Boolean)))]
  }, [candidates])


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


  const statuses = ['all', 'New', 'Not Reachable', 'Shortlisted', 'Rejected', 'KIV For Other Roles']

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'Not Reachable':
        return 'bg-purple-100 text-purple-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'KIV For Other Roles':
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
    const matchesCity = selectedCity === 'all' || candidate.location_city === selectedCity

    const matchesGender = selectedGender === 'all' || candidate.gender === selectedGender
    const matchesEducation = selectedEducation === 'all' || candidate.education_qualification_short === selectedEducation

    let matchesExperience = true
    if (selectedExperience !== 'all') {
        const years = Number(candidate.experience_years || 0)
        if (selectedExperience === '0-1') matchesExperience = years >= 0 && years <= 1
        if (selectedExperience === '2-4') matchesExperience = years >= 2 && years <= 4
        if (selectedExperience === '5+') matchesExperience = years >= 5
    }

    const matchesSkill =
    selectedSkill === 'all' ||
    (candidate.cover_letter &&
      candidate.cover_letter.split(',').map(s => s.trim()).includes(selectedSkill))

    return matchesSearch && matchesStatus && matchesCity && matchesGender && matchesEducation && matchesExperience && matchesSkill
  })



  const sortedCandidates = useMemo(() => {
      const candidatesCopy = [...filteredCandidates];
      candidatesCopy.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      return candidatesCopy;
  }, [filteredCandidates, sortOrder]);

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

  const handleIssueOffer = async (candidate) => {
      if (!confirm(`Issue offer to ${candidate.first_name} ${candidate.last_name}?`)) return;

      try {
        await candidatesAPI.issueOffer(candidate.id); // 👈 backend API call
        alert("Offer issued successfully!");
        fetchCandidates(); // refresh
      } catch (err) {
        console.error("Failed to issue offer", err);
        alert("Failed to issue offer");
      }
  };

  // Pagination logic
  const indexOfLast = currentPage * candidatesPerPage;
  const indexOfFirst = indexOfLast - candidatesPerPage;
  const currentCandidates = sortedCandidates.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(sortedCandidates.length / candidatesPerPage);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage job candidates and applications</p>
        </div>

        <div className="flex gap-3">
        <CandidateActions />
        <button className="btn-primary flex items-center" onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates using name or email..."
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
          <div className="sm:w-48">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="input-field"
              >
                {genderOptions.map(gender => (
                  <option key={gender} value={gender}>
                    {gender === 'all' ? 'All Genders' : gender}
                  </option>
                ))}
              </select>
          </div>
          <div className="sm:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field"
              >
                {cityOptions.map(city => (
                  <option key={city} value={city}>
                    {city === 'all' ? 'All Cities' : city}
                  </option>
                ))}
              </select>
          </div>
          <div className="sm:w-48">
              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="input-field"
              >
                {educationOptions.map(edu => (
                  <option key={edu} value={edu}>
                    {edu === 'all' ? 'All Education' : edu}
                  </option>
                ))}
              </select>
          </div>

          <div className="sm:w-48">
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="input-field"
              >
                {experienceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
          </div>
{/*           <div className="sm:w-48"> */}
{/*               <select */}
{/*                 value={selectedSkill} */}
{/*                 onChange={(e) => setSelectedSkill(e.target.value)} */}
{/*                 className="input-field" */}
{/*               > */}
{/*                 {skillOptions.map(skill => ( */}
{/*                   <option key={skill} value={skill}> */}
{/*                     {skill === 'all' ? 'All Skills' : skill} */}
{/*                   </option> */}
{/*                 ))} */}
{/*               </select> */}
{/*           </div> */}
          <div className="sm:w-48">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field"
              >
                <option value="desc">Date: Newest First</option>
                <option value="asc">Date: Oldest First</option>
              </select>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto overflow-y-auto max-h-[75vh]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qualification</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PQE</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
            {userRole === "ADMIN" && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created By
              </th>
            )}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentCandidates.map((candidate, index) => (
            <tr key={candidate.id} className="hover:bg-gray-50">
              {/* ✅ Serial Number */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {(currentPage - 1) * candidatesPerPage + index + 1}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {candidate.first_name} {candidate.last_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.gender}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.location_city}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.education_qualification_short}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.experience_years}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(candidate.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")}
              </td>
              {userRole === "ADMIN" && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.created_by_user?.username || "—"}
                  </td>
              )}
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
                  <label className="cursor-pointer text-blue-600 hover:text-blue-900" title="Upload Resume">
                    📄
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleResumeUpload(candidate.id, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {candidate.resume_url && (
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                      title="Download Resume"
                    >
                      ⬇️
                    </a>
                  )}
                  {candidate.status === "Shortlisted" && (
                    <button
                      className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs hover:bg-indigo-700"
                      onClick={() => handleIssueOffer(candidate)}
                    >
                      Issue Offer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
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
