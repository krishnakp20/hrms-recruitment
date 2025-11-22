import { useEffect, useState } from "react";
import api from "../services/api";

const CandidateView = ({ isOpen, onClose, candidate }) => {
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    if (candidate?.job_id) {
      api.get(`/jobs/minimal`)
        .then(res => {
          const job = res.data.find(j => j.id === candidate.job_id);
          setJobTitle(job ? job.position_title : "");
        })
        .catch(err => console.error("Failed to fetch job title:", err));
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-xl relative overflow-y-auto max-h-[90vh]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
          Candidate Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">

          {/* PERSONAL INFO */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Personal Information</h3>
            <div className="space-y-1">
              <p><strong>First Name:</strong> {candidate.first_name}</p>
              <p><strong>Last Name:</strong> {candidate.last_name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Phone:</strong> {candidate.phone}</p>
              <p><strong>Gender:</strong> {candidate.gender}</p>
            </div>
          </div>

          {/* JOB INFO */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Job Information</h3>
            <div className="space-y-1">
              <p><strong>Job Title:</strong> {jobTitle || candidate.job_id}</p>
              <p><strong>Process:</strong> {candidate.process}</p>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Location</h3>
            <div className="space-y-1">
              <p><strong>State:</strong> {candidate.location_state}</p>
              <p><strong>City:</strong> {candidate.location_city}</p>
              <p><strong>Area:</strong> {candidate.location_area}</p>
              <p><strong>Pincode:</strong> {candidate.location_pincode}</p>
            </div>
          </div>

          {/* EDUCATION */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Education</h3>
            <div className="space-y-1">
              <p><strong>Qualification:</strong> {candidate.education_qualification_short}</p>
              <p className="whitespace-pre-line text-gray-700">
                {candidate.education_qualification_detailed}
              </p>
            </div>
          </div>

          {/* EXPERIENCE */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Experience</h3>
            <div className="space-y-1">
              <p><strong>Experience (Years):</strong> {candidate.experience_years}</p>
              <p><strong>Notice Period:</strong> {candidate.notice_period}</p>
              <p><strong>Current Compensation:</strong> {candidate.current_compensation}</p>
              <p><strong>Expected Compensation:</strong> {candidate.expected_compensation}</p>
            </div>
          </div>

          {/* DESIGNATION */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Designation</h3>
            <div className="space-y-1">
              <p>{candidate.designation}</p>
            </div>
          </div>

          {/* SOURCE */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Source</h3>
            <div className="space-y-1">
              <p><strong>Source:</strong> {candidate.source}</p>
              <p><strong>Details:</strong> {candidate.source_details}</p>
            </div>
          </div>

          {/* STATUS */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-2">Status</h3>
            <p><strong>Status:</strong> {candidate.status}</p>
            <p><strong>In Pool:</strong> {candidate.is_in_pool ? "Yes" : "No"}</p>
          </div>

          {/* EXPERIENCE DETAILS */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-600 mb-2">Experience Details</h3>
            <p className="bg-gray-50 p-3 rounded border">
              {candidate.experience_details}
            </p>
          </div>

          {/* HR SCREENING ANSWERS */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-600 mb-2">HR Initial Screening Answers</h3>
            <p className="bg-gray-50 p-3 rounded border whitespace-pre-line">
              {candidate.hr_initial_screening_answers}
            </p>
          </div>

          {/* SKILLS */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-600 mb-2">Skills</h3>
            <p className="bg-gray-50 p-3 rounded border whitespace-pre-line">
              {candidate.cover_letter}
            </p>
          </div>

          {/* NOTES */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-gray-600 mb-2">Notes</h3>
            <p className="bg-gray-50 p-3 rounded border">
              {candidate.notes}
            </p>
          </div>

          {/* REASON OF REJECTION */}
          {candidate.reason_of_rejection && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-600 mb-2">Reason of Rejection</h3>
              <p className="bg-gray-50 p-3 rounded border whitespace-pre-line">
                {candidate.reason_of_rejection}
              </p>
            </div>
          )}

          {/* REASON FOR KIV */}
          {candidate.reason_for_kiv_other_roles && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-600 mb-2">Reason for KIV Other Roles</h3>
              <p className="bg-gray-50 p-3 rounded border whitespace-pre-line">
                {candidate.reason_for_kiv_other_roles}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CandidateView;
