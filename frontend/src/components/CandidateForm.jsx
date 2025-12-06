import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { candidatesAPI } from '../services/api'
import api from '../services/api'


const INDIAN_STATES = [
  "Andhra Pradesh",
  "Andaman and Nicobar Islands",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];


const CandidateForm = ({ isOpen, onClose, onSuccess, editCandidate = null }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobList, setJobList] = useState([]);
  const [screeningQuestions, setScreeningQuestions] = useState([]);
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
    source: 'Job Portal',
    source_details: '',
    status: 'New',
    notes: '',
    is_in_pool: false,
    job_id: '',
    process: '',
    hr_initial_screening_answers: '',
    f2f_interview_date: '',
    reason_of_rejection: '',
    reason_for_kiv_other_roles: ''
  })

  useEffect(() => {
      if (editCandidate) {
        setFormData(prev => ({
          ...prev,
          ...editCandidate,
          f2f_interview_date: editCandidate.f2f_interview_date
            ? editCandidate.f2f_interview_date.split("T")[0]
            : '',
          is_in_pool: Boolean(editCandidate.is_in_pool),
        }));
      }
  }, [editCandidate]);


  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const res = await api.get("/jobs/minimal");
          setJobList(res.data || []);
        } catch (error) {
          console.error("Failed to load jobs:", error);
        }
      };

      fetchJobs();
  }, []);


  useEffect(() => {
      const fetchScreeningQuestions = async () => {
        if (!formData.job_id) return;

        try {
          const res = await api.get(`/questions/${formData.job_id}/Initial%20Screening`);
          setScreeningQuestions(res.data || []);
        } catch (err) {
          console.error("Failed to load screening questions:", err);
          setScreeningQuestions([]);
        }
      };

      fetchScreeningQuestions();
  }, [formData.job_id]);


  const handleChange = async (e) => {
      const { name, value, type, checked } = e.target;

      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

      if (name === "job_id" && value) {
        try {
          const res = await api.get(`/questions/${value}/Initial%20Screening`);
          setScreeningQuestions(res.data || []);
        } catch (err) {
          console.error("Failed to load screening questions:", err);
          setScreeningQuestions([]);
        }
      }
  };


  const handleSubmit = async (e) => {
      e.preventDefault()

      if (loading) return;
      setLoading(true)

      setError('')

      // Required fields
      const requiredFields = [
        { name: 'first_name', label: 'First Name' },
        { name: 'phone', label: 'Phone' },
        { name: 'job_id', label: 'Job Title' },
        { name: 'process', label: 'Process' },
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
          experience_years: String(formData.experience_years),
          notice_period: parseInt(formData.notice_period) || 0,
          current_compensation: parseInt(formData.current_compensation) || 0,
          expected_compensation: parseInt(formData.expected_compensation) || 0,
          f2f_interview_date: formData.f2f_interview_date || null,
        }

        let savedCandidate;

        if (editCandidate) {
          savedCandidate = await candidatesAPI.update(editCandidate.id, cleanedData);
        } else {
          savedCandidate = await candidatesAPI.create(cleanedData);
        }

        const candidateId = editCandidate ? editCandidate.id : savedCandidate.data.id;

        // Auto-create application
        if (
          cleanedData.status === "Shortlisted" &&
          cleanedData.is_in_pool &&
          cleanedData.job_id
        ) {
          try {
            await api.post("/applications/", {
              candidate_id: candidateId,
              job_id: cleanedData.job_id,
              status: "Applied",
            });
          } catch (err) {
            console.error("Application creation failed:", err);
          }
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
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone No</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
              <input id="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <select
                id="job_id"
                name="job_id"
                value={formData.job_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Job Title</option>
                {jobList.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.position_title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Process</label>
              <input
                id="process"
                name="process"
                value={formData.process}
                onChange={handleChange}
                className="input-field"
              />
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
              <select
                  id="location_state"
                  name="location_state"
                  value={formData.location_state}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
              </select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="education_qualification_short" className="block text-sm font-medium text-gray-700 mb-1">Education Qualification</label>
                <select
                  id="education_qualification_short"
                  name="education_qualification_short"
                  value={formData.education_qualification_short}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Education</option>
                  <option value="IXth">IXth</option>
                  <option value="Xth">Xth</option>
                  <option value="XIIth">XIIth</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>

              <div>
                <label htmlFor="education_qualification_detailed" className="block text-sm font-medium text-gray-700 mb-1">Education Qualification (Detailed)</label>
                <textarea id="education_qualification_detailed" name="education_qualification_detailed" value={formData.education_qualification_detailed} onChange={handleChange} className="input-field" />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">Post Qualification Experience (Years)</label>
              <input id="experience_years" name="experience_years" value={formData.experience_years} onChange={handleChange} className="input-field" />
            </div>
            <div>
                <label htmlFor="experience_details" className="block text-sm font-medium text-gray-700 mb-1">Experience Details</label>
                <textarea id="experience_details" name="experience_details" value={formData.experience_details} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label htmlFor="current_compensation" className="block text-sm font-medium text-gray-700 mb-1">Current Compensation (per Month) </label>
              <input id="current_compensation" name="current_compensation" type="number" value={formData.current_compensation} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="expected_compensation" className="block text-sm font-medium text-gray-700 mb-1">Expected Compensation (per Month) </label>
              <input id="expected_compensation" name="expected_compensation" type="number" value={formData.expected_compensation} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="notice_period" className="block text-sm font-medium text-gray-700 mb-1">Notice Period (Days)</label>
              <input id="notice_period" name="notice_period" type="number" value={formData.notice_period} onChange={handleChange} className="input-field" />
            </div>
            <div>
                <label htmlFor="resume_url" className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input id="resume_url" name="resume_url" value={formData.resume_url} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
            <textarea id="cover_letter" name="cover_letter" value={formData.cover_letter} onChange={handleChange} className="input-field" />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select id="source" name="source" value={formData.source} onChange={handleChange} className="input-field">
                  {[
                    'Internal Career Page',
                    'Job Portal',
                    'Social Media',
                    'Campus Placement',
                    'Reference',
                    'Walk-in',
                    'WhatsApp'
                  ].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="source_details" className="block text-sm font-medium text-gray-700 mb-1">Source Details</label>
                <input id="source_details" name="source_details" value={formData.source_details} onChange={handleChange} className="input-field" />
              </div>
          </div>

          {/* Show screening questions if available */}
          {screeningQuestions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded border mb-4">
                <h3 className="text-sm font-semibold mb-2">Initial Screening Questions</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {screeningQuestions.map((q, idx) => (
                    <li key={idx} className="text-gray-700">{q}</li>
                  ))}
                </ul>
              </div>
          )}

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HR Initial Screening Answers
              </label>
              <textarea
                id="hr_initial_screening_answers"
                name="hr_initial_screening_answers"
                value={formData.hr_initial_screening_answers}
                onChange={handleChange}
                className="input-field"
                placeholder="Write answers here..."
              />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="input-field">
                  {[
                     'New',
                     'Not Reachable',
                     'Shortlisted',
                     'Rejected',
                     'KIV For Other Roles'
                  ].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="input-field" />
              </div>

              {formData.status === "Shortlisted" && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        F2F Interview Date
                      </label>
                      <input
                        type="date"
                        name="f2f_interview_date"
                        value={formData.f2f_interview_date || ''}
                        onChange={handleChange}
                        className="input-field"
                      />
                  </div>
              )}

          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason of Rejection</label>
              <textarea
                id="reason_of_rejection"
                name="reason_of_rejection"
                value={formData.reason_of_rejection}
                onChange={handleChange}
                className="input-field"
              />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for KIV Other Roles</label>
              <textarea
                id="reason_for_kiv_other_roles"
                name="reason_for_kiv_other_roles"
                value={formData.reason_for_kiv_other_roles}
                onChange={handleChange}
                className="input-field"
              />
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
