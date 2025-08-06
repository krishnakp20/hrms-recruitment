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
            <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" className="input-field" />
            <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" className="input-field" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input-field" />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="input-field" />
            <input name="location_state" value={formData.location_state} onChange={handleChange} placeholder="State" className="input-field" />
            <input name="location_city" value={formData.location_city} onChange={handleChange} placeholder="City" className="input-field" />
            <input name="location_area" value={formData.location_area} onChange={handleChange} placeholder="Area" className="input-field" />
            <input name="location_pincode" value={formData.location_pincode} onChange={handleChange} placeholder="Pincode" className="input-field" />
          </div>

          <textarea name="education_qualification_short" value={formData.education_qualification_short} onChange={handleChange} placeholder="Education Qualification Short" className="input-field" />
          <textarea name="education_qualification_detailed" value={formData.education_qualification_detailed} onChange={handleChange} placeholder="Education Qualification Detailed" className="input-field" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} placeholder="Experience Years" className="input-field" />
            <input name="notice_period" type="number" value={formData.notice_period} onChange={handleChange} placeholder="Notice Period (days)" className="input-field" />
            <input name="current_compensation" type="number" value={formData.current_compensation} onChange={handleChange} placeholder="Current Compensation" className="input-field" />
            <input name="expected_compensation" type="number" value={formData.expected_compensation} onChange={handleChange} placeholder="Expected Compensation" className="input-field" />
          </div>

          <textarea name="experience_details" value={formData.experience_details} onChange={handleChange} placeholder="Experience Details" className="input-field" />

          <input name="resume_url" value={formData.resume_url} onChange={handleChange} placeholder="Resume URL" className="input-field" />
          <textarea name="cover_letter" value={formData.cover_letter} onChange={handleChange} placeholder="Cover Letter" className="input-field" />

          <select name="source" value={formData.source} onChange={handleChange} className="input-field">
            {['Internal Career Page','Job Portal','Social Media','Campus Placement','Reference','Walk-in','WhatsApp','Manual Entry'].map(option => (
              <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <input name="source_details" value={formData.source_details} onChange={handleChange} placeholder="Source Details" className="input-field" />

          <select name="status" value={formData.status} onChange={handleChange} className="input-field">
            {['New','Shortlisted','Interviewed','Rejected','Hired','Pool'].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="input-field" />

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
