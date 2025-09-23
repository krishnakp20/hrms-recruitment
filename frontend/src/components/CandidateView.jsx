const CandidateView = ({ isOpen, onClose, candidate }) => {
  if (!isOpen || !candidate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-3xl p-6 rounded-xl shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-lg font-bold"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Candidate Details</h2>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
          {/* Personal Info */}
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Personal Info</h3>
            <div className="space-y-1">
              <p><strong>First Name:</strong> {candidate.first_name}</p>
              <p><strong>Last Name:</strong> {candidate.last_name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Phone:</strong> {candidate.phone}</p>
              <p><strong>Gender:</strong> {candidate.gender}</p>
            </div>
          </div>

          {/* Location Info */}
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Location</h3>
            <div className="space-y-1">
              <p><strong>City:</strong> {candidate.location_city}</p>
              <p><strong>State:</strong> {candidate.location_state}</p>
              <p><strong>Area:</strong> {candidate.location_area}</p>
              <p><strong>Pincode:</strong> {candidate.location_pincode}</p>
            </div>
          </div>

          {/* Experience & CTC */}
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Experience & CTC</h3>
            <div className="space-y-1">
              <p><strong>Experience:</strong> {candidate.experience_years} years</p>
              <p><strong>Notice Period:</strong> {candidate.notice_period} days</p>
              <p><strong>Current CTC:</strong> {candidate.current_compensation}</p>
              <p><strong>Expected CTC:</strong> {candidate.expected_compensation}</p>
            </div>
          </div>

          {/* Qualification */}
          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Education</h3>
            <div className="space-y-1">
              <p><strong>Qualification:</strong> {candidate.education_qualification_short}</p>
              <p className="text-gray-700">{candidate.education_qualification_detailed}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Source</h3>
            <div className="space-y-1">
              <p><strong>Source:</strong> {candidate.source}</p>
              <p className="text-gray-700">{candidate.source_details}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-600 font-semibold mb-2">Status</h3>
            <div className="space-y-1">
              <p><strong>Status:</strong> {candidate.status}</p>
            </div>
          </div>

          {/* Experience Details */}
          <div className="md:col-span-2">
            <h3 className="text-gray-600 font-semibold mb-2">Experience Details</h3>
            <p className="bg-gray-50 p-3 rounded-md border text-gray-700">
              {candidate.experience_details}
            </p>
          </div>

          {/* Cover Letter */}
          <div className="md:col-span-2">
            <h3 className="text-gray-600 font-semibold mb-2">Skills</h3>
            <p className="bg-gray-50 p-3 rounded-md border text-gray-700">
              {candidate.cover_letter}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-gray-600 font-semibold mb-2">Notes</h3>
            <p className="bg-gray-50 p-3 rounded-md border text-gray-700">
              {candidate.notes}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateView
