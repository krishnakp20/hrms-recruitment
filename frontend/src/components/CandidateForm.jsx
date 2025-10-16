import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { candidatesAPI } from '../services/api'

const CandidateForm = ({ isOpen, onClose, onSuccess, editCandidate = null }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    location_state: '',
    location_city: '',
    location_area: '',
    location_pincode: '',
    education_qualification_short: '',
    education_qualification_detailed: '',
    experience_years: '',
    experience_details: '',
    notice_period: '',
    current_compensation: '',
    expected_compensation: '',
    designation: '',
    resume_url: '',
    cover_letter: '',
    source: 'Manual Entry',
    source_details: '',
    status: 'New',
    notes: '',
    is_in_pool: false
  })

  useEffect(() => {
    if (editCandidate) {
      setFormData({
        ...formData,
        ...editCandidate,
        is_in_pool: Boolean(editCandidate.is_in_pool)
      })
    }
  }, [editCandidate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
      setError('')

      // Required fields
      const requiredFields = [
        { name: 'first_name', label: 'First Name' },
        { name: 'last_name', label: 'Last Name' },
        { name: 'email', label: 'Email' },
        { name: 'phone', label: 'Phone' },
        { name: 'gender', label: 'Gender' },
        { name: 'location_city', label: 'City' },
        { name: 'education_qualification_short', label: 'Education Qualification (Short)' },
        { name: 'experience_years', label: 'Experience (Years)' },
        { name: 'cover_letter', label: 'Skills' },
      ];

      // Check for empty required fields
      const emptyField = requiredFields.find(field => {
        const value = formData[field.name];
        return value === '' || value === null || value === undefined;
      });

      if (emptyField) {
        setError(`${emptyField.label} is required`);
        setLoading(false);
        return;
      }

      try {
        const cleanedData = {
          ...formData,
          experience_years: parseInt(formData.experience_years) || 0,
          notice_period: parseInt(formData.notice_period) || 0,
          current_compensation: parseInt(formData.current_compensation) || 0,
          expected_compensation: parseInt(formData.expected_compensation) || 0,
        }

        if (editCandidate) {
          await candidatesAPI.update(editCandidate.id, cleanedData)
        } else {
          await candidatesAPI.create(cleanedData)
        }

        onSuccess()
        onClose()
      } catch (err) {
        console.error('Error saving candidate:', err)
        setError(err.response?.data?.detail || 'Failed to save candidate')
      } finally {
        setLoading(false)
      }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editCandidate ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="location_state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input id="location_state" name="location_state" value={formData.location_state} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="location_city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input id="location_city" name="location_city" value={formData.location_city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="location_area" className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input id="location_area" name="location_area" value={formData.location_area} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="location_pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input id="location_pincode" name="location_pincode" value={formData.location_pincode} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input id="designation" name="designation" value={formData.designation} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="education_qualification_short" className="block text-sm font-medium text-gray-700 mb-1">Education Qualification (Short)</label>
            <textarea id="education_qualification_short" name="education_qualification_short" value={formData.education_qualification_short} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="education_qualification_detailed" className="block text-sm font-medium text-gray-700 mb-1">Education Qualification (Detailed)</label>
            <textarea id="education_qualification_detailed" name="education_qualification_detailed" value={formData.education_qualification_detailed} onChange={handleChange} className="input-field" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input id="experience_years" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="notice_period" className="block text-sm font-medium text-gray-700 mb-1">Notice Period (Days)</label>
              <input id="notice_period" name="notice_period" type="number" value={formData.notice_period} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="current_compensation" className="block text-sm font-medium text-gray-700 mb-1">Current Compensation (per Month) </label>
              <input id="current_compensation" name="current_compensation" type="number" value={formData.current_compensation} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="expected_compensation" className="block text-sm font-medium text-gray-700 mb-1">Expected Compensation (per Month) </label>
              <input id="expected_compensation" name="expected_compensation" type="number" value={formData.expected_compensation} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="experience_details" className="block text-sm font-medium text-gray-700 mb-1">Experience Details</label>
            <textarea id="experience_details" name="experience_details" value={formData.experience_details} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
            <input id="resume_url" name="resume_url" value={formData.resume_url} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <textarea id="cover_letter" name="cover_letter" value={formData.cover_letter} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select id="source" name="source" value={formData.source} onChange={handleChange} className="input-field">
              {['Internal Career Page','Job Portal','Social Media','Campus Placement','Reference','Walk-in','WhatsApp','Manual Entry'].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="source_details" className="block text-sm font-medium text-gray-700 mb-1">Source Details</label>
            <input id="source_details" name="source_details" value={formData.source_details} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className="input-field">
              {['New','Shortlisted','Interviewed','Rejected','Hired','Pool'].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="input-field" />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_in_pool"
              checked={formData.is_in_pool}
              onChange={handleChange}
            />
            <span>Add to Candidate Pool</span>
          </label>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editCandidate ? 'Update Candidate' : 'Save Candidate'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default CandidateForm
