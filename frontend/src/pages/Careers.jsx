import { useEffect, useState } from "react";
import { jobsAPI } from "../services/api";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await jobsAPI.getPublished();
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

    const totalPages = Math.ceil(jobs.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = jobs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Opportunities</h1>
        <p className="text-gray-600">Explore our current job openings</p>
      </div>

      <div className="card overflow-x-auto bg-white shadow-md rounded-xl max-h-[500px] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">S.No</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Compensation</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vacancies</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentItems.length > 0 ? (
            currentItems.map((job, index) => (
              <tr key={job.id} className="hover:bg-gray-50">
                {/* Serial Number */}
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{job.position_title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.department?.name || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.location_details || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  ₹{job.compensation_min?.toLocaleString()} - ₹{job.compensation_max?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.number_of_vacancies}</td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm">
                    Apply Now
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                No jobs available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
        {/* Prev */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {/* Page Info */}
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next */}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    </div>

  );
};

export default Careers;
