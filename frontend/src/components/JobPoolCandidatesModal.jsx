import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { jobsAPI } from '../services/api'

const JobPoolCandidatesModal = ({ isOpen, onClose, jobId }) => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && jobId) {
      fetchPoolCandidates()
    }
  }, [isOpen, jobId])

  const fetchPoolCandidates = async () => {
    setLoading(true)
    try {
      const res = await jobsAPI.getPoolForJob(jobId)
      setCandidates(res.data)
    } catch (err) {
      console.error('Failed to fetch pool candidates', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Pool Candidates
          </Dialog.Title>

          {loading ? (
            <p>Loading...</p>
          ) : candidates.length === 0 ? (
            <p>No matched candidates in the pool.</p>
          ) : (
            <ul className="space-y-2">
              {candidates.map(candidate => (
                <li key={candidate.id} className="border rounded p-3">
                  <div className="font-semibold">{candidate.first_name}</div>
                  <div className="text-sm text-gray-600">{candidate.email}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 text-right">
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default JobPoolCandidatesModal
