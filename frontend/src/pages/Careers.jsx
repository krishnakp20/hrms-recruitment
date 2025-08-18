import { useEffect, useState } from "react";
import { jobsAPI } from "../services/api";

const Careers = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await jobsAPI.getPublished();
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Opportunities</h1>
        <p className="text-gray-600">Explore our current job openings</p>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Compensation</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vacancies</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{job.position_title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.department?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.location_details}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  ₹{job.compensation_min} - ₹{job.compensation_max}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.number_of_vacancies}</td>
                <td className="px-6 py-4 text-right">
                  <button className="btn-primary">Apply Now</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default Careers;
