import { Briefcase, Building2, Calendar, DollarSign, MapPin, User } from 'lucide-react'

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary-600" />
            Job Details
          </h2>
          <button className="text-gray-500 hover:text-gray-700 text-xl" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-800">
          <div><strong>Position Title:</strong> {job.position_title}</div>
          <div><strong>Position Code:</strong> {job.position_code}</div>
          <div><strong>Level:</strong> {job.level || 'N/A'}</div>
          <div><strong>Grade:</strong> {job.grade || 'N/A'}</div>
          <div><strong>Department:</strong> {job.department?.name || 'N/A'}</div>
          <div><strong>Sub-Department:</strong> {job.sub_department || 'N/A'}</div>
          <div><strong>Branch:</strong> {job.branch || 'N/A'}</div>
          <div><strong>Process:</strong> {job.process || 'N/A'}</div>
          <div><strong>Reporting Title:</strong> {job.reporting_to_title || 'N/A'}</div>
          <div><strong>Reporting Manager:</strong> {job.reporting_to_manager || 'N/A'}</div>
          <div><strong>Location Type:</strong> {job.location_type || 'N/A'}</div>
          <div><strong>Location Details:</strong> {job.location_details || 'N/A'}</div>
          <div><strong>Experience Level:</strong> {job.experience_level || 'N/A'}</div>
          <div><strong>Number of Vacancies:</strong> {job.number_of_vacancies}</div>
          <div><strong>Compensation:</strong> ₹{job.compensation_min?.toLocaleString()} - ₹{job.compensation_max?.toLocaleString()}</div>
          <div><strong>Employment Type:</strong> {job.employment_type}</div>
          <div><strong>Hiring Deadline:</strong> {job.hiring_deadline}</div>
          <div><strong>Approval Authority:</strong> {job.approval_authority || 'N/A'}</div>
          <div><strong>Status:</strong> {job.status}</div>
          <div><strong>Created By:</strong> {job.created_by_user?.username}</div>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Required Skills</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{job.required_skills || 'N/A'}</p>
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{job.job_description || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsModal
