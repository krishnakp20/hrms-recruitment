import { useState, useEffect } from "react"
import { Eye, Download, X } from "lucide-react"
import { candidatesAPI } from "../services/api"

const CandidateOffers = () => {
  const [offers, setOffers] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOffers = async () => {
    try {
      const res = await candidatesAPI.getAllOffers()
      setOffers(res.data)
    } catch (err) {
      console.error("Failed to fetch offers", err)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "SENT":
        return "bg-blue-100 text-blue-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const currentItems = offers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Offers</h1>
          <p className="text-gray-600">Manage issued offer letters</p>
        </div>
      </div>

      {/* Table */}
      <div className="card relative bg-white shadow-md rounded-xl overflow-x-auto overflow-y-auto max-h-[500px]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.length > 0 ? (
            currentItems.map((offer, index) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {offer.candidate?.first_name} {offer.candidate?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status)}`}
                  >
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {offer.sent_at
                    ? new Date(offer.sent_at).toLocaleDateString("en-GB").replace(/\//g, "-")
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => setPreviewUrl(offer.file_path)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={offer.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                      title="Download Offer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No offers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      </div>
      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white w-11/12 h-5/6 rounded-2xl shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h2 className="text-lg font-semibold">Offer Preview</h2>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* PDF Iframe */}
            <iframe
              src={previewUrl}
              title="Offer Preview"
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CandidateOffers
