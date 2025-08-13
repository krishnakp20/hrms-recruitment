// import { useState, useEffect } from 'react'
// import { Plus, Search, Edit, Trash2, Eye, Users, Calendar } from 'lucide-react'
// import { jobsAPI } from '../services/api'
// import JobForm from '../components/JobForm'

// const Jobs = () => {
//   const [jobs, setJobs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedStatus, setSelectedStatus] = useState('all')
//   const [showJobForm, setShowJobForm] = useState(false)
//   const [editingJob, setEditingJob] = useState(null)

//   useEffect(() => {
//     fetchJobs()
//   }, [])

//   const fetchJobs = async () => {
//     try {
//       setLoading(true)
//       const response = await jobsAPI.getAll()
//       setJobs(response.data)
//     } catch (err) {
//       console.error('Error fetching jobs:', err)
//       setError('Failed to load jobs')
//       setJobs([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const statuses = ['all', 'ACTIVE', 'DRAFT', 'CLOSED', 'ARCHIVED', 'PENDING_APPROVAL', 'APPROVED']

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'ACTIVE':
//         return 'bg-green-100 text-green-800'
//       case 'DRAFT':
//         return 'bg-yellow-100 text-yellow-800'
//       case 'CLOSED':
//         return 'bg-red-100 text-red-800'
//       case 'ARCHIVED':
//         return 'bg-gray-100 text-gray-800'
//       case 'PENDING_APPROVAL':
//         return 'bg-blue-100 text-blue-800'
//       case 'APPROVED':
//         return 'bg-purple-100 text-purple-800'
//       default:
//         return 'bg-gray-100 text-gray-800'
//     }
//   }

//   const filteredJobs = jobs.filter(job => {
//     const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          job.location_details?.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
//     return matchesSearch && matchesStatus
//   })

//   const handleDeleteJob = async (jobId) => {
//     if (window.confirm('Are you sure you want to delete this job?')) {
//       try {
//         await jobsAPI.delete(jobId)
//         setJobs(jobs.filter(job => job.id !== jobId))
//       } catch (err) {
//         console.error('Error deleting job:', err)
//         alert('Failed to delete job')
//       }
//     }
//   }

//   const handleEditJob = (job) => {
//     setEditingJob(job)
//     setShowJobForm(true)
//   }

//   const handleCreateJob = () => {
//     setEditingJob(null)
//     setShowJobForm(true)
//   }

//   const handleJobFormSuccess = () => {
//     fetchJobs() // Refresh the jobs list
//   }

//   const handleCloseJobForm = () => {
//     setShowJobForm(false)
//     setEditingJob(null)
//   }

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
//             <p className="text-gray-600">Loading jobs...</p>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3, 4, 5, 6].map((i) => (
//             <div key={i} className="card animate-pulse">
//               <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
//               <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
//               <div className="space-y-2">
//                 <div className="h-3 bg-gray-300 rounded w-full"></div>
//                 <div className="h-3 bg-gray-300 rounded w-3/4"></div>
//                 <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
//             <p className="text-red-600">{error}</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
//           <p className="text-gray-600">Manage job postings and openings</p>
//         </div>
//         <button 
//           className="btn-primary flex items-center"
//           onClick={handleCreateJob}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Post New Job
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="card">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search jobs..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="input-field pl-10"
//               />
//             </div>
//           </div>
//           <div className="sm:w-48">
//             <select
//               value={selectedStatus}
//               onChange={(e) => setSelectedStatus(e.target.value)}
//               className="input-field"
//             >
//               {statuses.map(status => (
//                 <option key={status} value={status}>
//                   {status === 'all' ? 'All Status' : status.replace('_', ' ')}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Jobs Grid */}
//       {filteredJobs.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredJobs.map((job) => (
//             <div key={job.id} className="card hover:shadow-lg transition-shadow duration-200">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
//                   <p className="text-sm text-gray-600">{job.department?.name || 'N/A'}</p>
//                 </div>
//                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
//                   {job.status?.replace('_', ' ')}
//                 </span>
//               </div>
              
//               <div className="space-y-3 mb-4">
//                 <div className="flex items-center text-sm text-gray-600">
//                   <Calendar className="h-4 w-4 mr-2" />
//                   Posted: {new Date(job.created_at).toLocaleDateString()}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Location: {job.location_details || 'N/A'}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Type: {job.employment_type || 'Full-time'}
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   Salary: ${job.compensation_min?.toLocaleString()} - ${job.compensation_max?.toLocaleString()}
//                 </div>
//                 <div className="flex items-center text-sm text-gray-600">
//                   <Users className="h-4 w-4 mr-2" />
//                   {job.applications?.length || 0} applications
//                 </div>
//               </div>

//               <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//                 <div className="flex space-x-2">
//                   <button className="text-primary-600 hover:text-primary-900">
//                     <Eye className="h-4 w-4" />
//                   </button>
//                   <button 
//                     className="text-gray-600 hover:text-gray-900"
//                     onClick={() => handleEditJob(job)}
//                   >
//                     <Edit className="h-4 w-4" />
//                   </button>
//                   <button 
//                     className="text-red-600 hover:text-red-900"
//                     onClick={() => handleDeleteJob(job.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//                 <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
//                   View Applications
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="card text-center py-12">
//           <p className="text-gray-500 text-lg">No jobs found</p>
//           <p className="text-gray-400 text-sm mt-2">
//             {searchTerm || selectedStatus !== 'all' 
//               ? 'Try adjusting your search criteria' 
//               : 'Create your first job posting to get started'
//             }
//           </p>
//         </div>
//       )}

//       {/* Job Form Modal */}
//       <JobForm
//         isOpen={showJobForm}
//         onClose={handleCloseJobForm}
//         onSuccess={handleJobFormSuccess}
//         editJob={editingJob}
//       />
//     </div>
//   )
// }

// export default Jobs 





import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, Send } from 'lucide-react'
import { jobsAPI } from '../services/api'
import JobForm from '../components/JobForm'
import JobDetailsModal from '../components/JobDetailsModal'
import JobPoolCandidatesModal from '../components/JobPoolCandidatesModal'
import { useAuth } from '../contexts/AuthContext';

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const { user } = useAuth();
  const userRole = user?.role;

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await jobsAPI.getAll()
      setJobs(response.data)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['all', 'Active', 'Draft', 'Closed', 'Archived', 'Pending Approval', 'Approved']

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.position_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location_details?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.delete(jobId)
        setJobs(jobs.filter(job => job.id !== jobId))
      } catch (err) {
        console.error('Error deleting job:', err)
        alert('Failed to delete job')
      }
    }
  }

  const handleEditJob = (job) => {
    setEditingJob(job)
    setShowJobForm(true)
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setShowJobForm(true)
  }

  const handleJobFormSuccess = () => {
    fetchJobs()
  }

  const handleCloseJobForm = () => {
    setShowJobForm(false)
    setEditingJob(null)
  }

  const handleViewJob = (job) => {
   setSelectedJob(job)
   setShowJobDetails(true)
  }

  const handleCloseJobDetails = () => {
    setSelectedJob(null)
    setShowJobDetails(false)
  }

  const handleViewPool = (jobId) => {
      setSelectedJobId(jobId)
      setShowPoolModal(true)
  }


  const handleSubmitForApproval = async (jobId) => {
      if (!window.confirm('Submit this job for approval?')) return;

      try {
        await jobsAPI.submitForApproval(jobId);
        alert('Job submitted for approval successfully.');
        fetchJobs();
      } catch (err) {
        console.error('Error submitting for approval:', err);
        alert(err.response?.data?.detail || 'Failed to submit job for approval');
      }
  };

  const handleApprove = async (jobId) => {

    try {
      await jobsAPI.approveJob(jobId);
      alert('Job approved successfully.');
      fetchJobs();
    } catch (err) {
      console.error("Failed to approve job", err);
      alert(err.response?.data?.detail || 'Failed to approve job');
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-yellow-100 text-yellow-800'
      case 'Closed': return 'bg-red-100 text-red-800'
      case 'Archived': return 'bg-gray-100 text-gray-800'
      case 'Pending Approval': return 'bg-blue-100 text-blue-800'
      case 'Approved': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage job postings and openings</p>
        </div>
        <button className="btn-primary flex items-center" onClick={handleCreateJob}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
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
                  {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pool / Vacancies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.position_title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.department?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.location_details || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.employment_type || 'Full-time'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{job.compensation_min?.toLocaleString()} - ₹{job.compensation_max?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium text-blue-600 cursor-pointer underline"
                    onClick={() => handleViewPool(job.id)}>
                  {job.pool_candidate_count || 0} / {job.number_of_vacancies || 0}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">

                    {job.status === 'Draft' && (
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleSubmitForApproval(job.id)}
                      >
                        <span title="Submit for Approval">
                          <Send className="h-4 w-4" />
                        </span>
                      </button>
                    )}

                    {job.status === 'Pending Approval' &&
                     (userRole === 'HR_SPOC' || userRole === 'ADMIN') && (
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleApprove(job.id)}
                        title="Approve Job"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}

                    <button className="text-primary-600 hover:text-primary-900" onClick={() => handleViewJob(job)}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => handleEditJob(job)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteJob(job.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Job Form Modal */}
      <JobForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        onSuccess={handleJobFormSuccess}
        editJob={editingJob}
      />

      <JobDetailsModal
          isOpen={showJobDetails}
          onClose={handleCloseJobDetails}
          job={selectedJob}
      />

      <JobPoolCandidatesModal
          isOpen={showPoolModal}
          onClose={() => setShowPoolModal(false)}
          jobId={selectedJobId}
      />

    </div>
  )
}

export default Jobs