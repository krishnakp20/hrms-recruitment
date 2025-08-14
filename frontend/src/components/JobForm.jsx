import { useState, useEffect } from 'react'
import { X, Save, Plus } from 'lucide-react'
import { jobsAPI, authAPI } from '../services/api'
import api from '../services/api'
import axios from 'axios'

const JobForm = ({ isOpen, onClose, onSuccess, editJob = null }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [departments, setDepartments] = useState([])
  const [jobsList, setJobsList] = useState([])
  const [workflowTemplates, setWorkflowTemplates] = useState([])
  const [recruiters, setRecruiters] = useState([])
  const [agencies, setAgencies] = useState([])

  const [formData, setFormData] = useState({
    position_title: '',
    position_code: '',
    level: '',
    grade: '',
    department_id: '',
    sub_department: '',
    process: '',
    reporting_to_title: '',
    reporting_to_manager: '',
    location_type: 'onsite',
    location_details: '',
    required_skills: '',
    experience_level: '',
    job_description: '',
    job_specification: '',
    number_of_vacancies: 1,
    compensation_min: '',
    compensation_max: '',
    employment_type: 'Full-time',
    hiring_deadline: '',
    approval_authority: '',
    recruiter_id: null,
    workflow_template_id: null,
    recruitment_agency_id: null
  })

  const selectedDepartment = departments.find(
      dept => dept.id === formData.department_id
  )
  const availableSubDepartments = selectedDepartment?.sub_departments || []


  useEffect(() => {

    const fetchDepartments = async () => {
      try {
        const res = await api.get('/jobs/departments/') // Replace with correct backend URL
        console.log('Departments:', res.data)

        const departmentsWithSubs = res.data.map(dept => ({
          ...dept,
          sub_departments: dept.sub_department ? [dept.sub_department] : []
        }))

        setDepartments(res.data)
        setDepartments(departmentsWithSubs)
      } catch (err) {
        console.error('Failed to load departments', err)
      }
    }

    fetchDepartments()

  const fetchExtras = async () => {
      try {
        const [jobsRes, workflowsRes, recruitersRes, agenciesRes] = await Promise.all([
          jobsAPI.getAll(),
          jobsAPI.getWorkflows(),
          authAPI.getRecruiters(),
          jobsAPI.getAgencies()
        ])

        setJobsList(jobsRes.data)
        setWorkflowTemplates(workflowsRes.data)
        setRecruiters(recruitersRes.data)
        setAgencies(agenciesRes.data)
      } catch (err) {
        console.error('Failed to load extra data', err)
      }
    }

    fetchExtras()



    if (editJob) {
      setFormData(prev => ({
        ...prev,
        position_title: editJob.position_title || '',
        position_code: editJob.position_code || '',
        level: editJob.level || '',
        grade: editJob.grade || '',
        department_id: editJob.department_id || '',
        sub_department: editJob.sub_department || '',
        process: editJob.process || '',
        reporting_to_title: editJob.reporting_to_title || '',
        reporting_to_manager: editJob.reporting_to_manager || '',
        location_type: editJob.location_type || 'onsite',
        location_details: editJob.location_details || '',
        required_skills: editJob.required_skills || '',
        experience_level: editJob.experience_level || '',
        job_description: editJob.job_description || '',
        job_specification: editJob.job_specification || '',
        number_of_vacancies: editJob.number_of_vacancies || 1,
        compensation_min: editJob.compensation_min || '',
        compensation_max: editJob.compensation_max || '',
        employment_type: editJob.employment_type || 'Full-time',
        hiring_deadline: editJob.hiring_deadline ? editJob.hiring_deadline.split('T')[0] : '',
        approval_authority: editJob.approval_authority || '',
        recruiter_id: editJob.recruiter_id || null,
        workflow_template_id: editJob.workflow_template_id || null,
        recruitment_agency_id: editJob.recruitment_agency_id || null
      }))
    }
  }, [editJob])


  const handleCopyFromJob = async (jobId) => {
  if (!jobId) {
      // Reset form to empty values
    setFormData({
    position_title: '',
    position_code: '',
    level: '',
    grade: '',
    department_id: '',
    sub_department: '',
    process: '',
    reporting_to_title: '',
    reporting_to_manager: '',
    location_type: 'onsite',
    location_details: '',
    required_skills: '',
    experience_level: '',
    job_description: '',
    job_specification: '',
    number_of_vacancies: 1,
    compensation_min: '',
    compensation_max: '',
    employment_type: 'Full-time',
    hiring_deadline: '',
    approval_authority: '',
    recruiter_id: null,
    workflow_template_id: null,
    recruitment_agency_id: null
    });
    return;
  }
  try {
    const res = await jobsAPI.getById(jobId)
    const jobData = res.data

    setFormData(prev => ({
      ...prev,
      ...jobData,
      hiring_deadline: jobData.hiring_deadline ? jobData.hiring_deadline.split('T')[0] : ''
    }))
  } catch (err) {
    console.error('Failed to copy job details', err)
  }
}


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Clean up the form data before sending
      const cleanedData = {
        ...formData,
        // Convert empty strings to null for optional fields
        level: formData.level || null,
        grade: formData.grade || null,
        department_id: formData.department_id,
        sub_department: formData.sub_department || null,
        process: formData.process || null,
        reporting_to_title: formData.reporting_to_title || null,
        reporting_to_manager: formData.reporting_to_manager || null,
        location_details: formData.location_details || null,
        required_skills: formData.required_skills || null,
        experience_level: formData.experience_level || null,
        job_description: formData.job_description || null,
        job_specification: formData.job_specification || null,
        number_of_vacancies: parseInt(formData.number_of_vacancies) || 1,
        compensation_min: formData.compensation_min ? parseInt(formData.compensation_min) : null,
        compensation_max: formData.compensation_max ? parseInt(formData.compensation_max) : null,
        hiring_deadline: formData.hiring_deadline || null,
        approval_authority: formData.approval_authority || null,
        recruiter_id: formData.recruiter_id || null,
        workflow_template_id: formData.workflow_template_id || null,
        recruitment_agency_id: formData.recruitment_agency_id || null
      }

      console.log('Sending job data:', cleanedData)
      
      if (editJob) {
        await jobsAPI.update(editJob.id, cleanedData)
      } else {
        await jobsAPI.create(cleanedData)
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving job:', err)
      setError(err.response?.data?.detail || 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editJob ? 'Edit Job' : 'Post New Job'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Copy from another job */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Copy Job Details From Another Job
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  onChange={(e) => handleCopyFromJob(e.target.value)}
                >
                  <option value="">Select Job</option>
                  {jobsList.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.position_title} ({job.position_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Assign a Recruitment Workflow Template
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.workflow_template_id || ''}
                  onChange={(e) => setFormData({ ...formData, workflow_template_id: parseInt(e.target.value) })}
                >
                  <option value="">Select Template</option>
                  {workflowTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>




          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="position_title"
                value={formData.position_title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Code *
              </label>
              <input
                type="text"
                name="position_code"
                value={formData.position_code}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., SWE-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Senior"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., G5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recruiters */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Assign Recruiter To Fill This Job Position
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.recruiter_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, recruiter_id: parseInt(e.target.value) || null })
              }
            >
              <option value="">Select a recruiter</option>
              {recruiters.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Agencies */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Assign Recruitment Agency To Fill This Job
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.recruitment_agency_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, recruitment_agency_id: parseInt(e.target.value) || null })
              }
            >
              <option value="">Select an agency</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
        </div>



          {/* Department Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Department</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value) })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Department
              </label>
              <select
                  name="sub_department"
                  value={formData.sub_department}
                  onChange={handleChange}
                  className="input-field"
              >
              <option value="">Select Sub-Department</option>
                  {availableSubDepartments.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>

            </div>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type
              </label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Details
              </label>
              <input
                type="text"
                name="location_details"
                value={formData.location_details}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Full-time">Full Time</option>
                <option value="Part-time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Management Trainee">Management Trainee</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Vacancies
              </label>
              <input
                type="number"
                name="number_of_vacancies"
                value={formData.number_of_vacancies}
                onChange={handleChange}
                min="1"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hiring Deadline
              </label>
              <input
                type="date"
                name="hiring_deadline"
                value={formData.hiring_deadline}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Compensation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                name="compensation_min"
                value={formData.compensation_min}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 80000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                name="compensation_max"
                value={formData.compensation_max}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 120000"
              />
            </div>
          </div>

          {/* Skills and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <textarea
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="e.g., Python, React, AWS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <input
                type="text"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 3-5 years"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Detailed job description..."
            />
          </div>

          {/* Job Specification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Specification
            </label>
            <textarea
              name="job_specification"
              value={formData.job_specification}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Detailed job specifications..."
            />
          </div>

          {/* Reporting Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting To Title
              </label>
              <input
                type="text"
                name="reporting_to_title"
                value={formData.reporting_to_title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Engineering Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reporting To Manager
              </label>
              <input
                type="text"
                name="reporting_to_manager"
                value={formData.reporting_to_manager}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., John Doe"
              />
            </div>
          </div>

          {/* Process and Authority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Process
              </label>
              <input
                type="text"
                name="process"
                value={formData.process}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Agile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Authority
              </label>
              <input
                type="text"
                name="approval_authority"
                value={formData.approval_authority}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., HR Director"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editJob ? 'Update Job' : 'Post Job'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobForm 