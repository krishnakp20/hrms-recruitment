import { useState, useEffect } from "react"
import { Eye, Download, X } from "lucide-react"
import { candidatesAPI } from "../services/api"

const CandidateOffers = () => {
  const [offers, setOffers] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)

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
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sent Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {offer.candidate?.first_name} {offer.candidate?.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      offer.status
                    )}`}
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
            ))}
          </tbody>
        </table>
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
