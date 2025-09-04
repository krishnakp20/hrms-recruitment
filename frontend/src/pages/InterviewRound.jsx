// src/pages/InterviewRound.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api' // your axios instance
import { ArrowRight } from 'lucide-react'

export default function InterviewRound() {
  const { interviewId, roundType } = useParams()
  const [currentQi, setCurrentQi] = useState(null)
  const [answeredInstances, setAnsweredInstances] = useState([])
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(false)
  const [roundPct, setRoundPct] = useState(0)
  const [fetchToggle, setFetchToggle] = useState(false)

  useEffect(() => {
    fetchNext()
    fetchAnsweredInstances()
    // eslint-disable-next-line
  }, [interviewId, roundType, fetchToggle])

  const fetchNext = async () => {
    try {
      const res = await api.get(`/interviews/${interviewId}/round/${roundType}/next-question`)
      setCurrentQi(res.data || null)
      setAnswerText('')
    } catch (err) {
      console.error('failed get next', err)
    }
  }

  const fetchAnsweredInstances = async () => {
    try {
      // Hit summary endpoint and derive answered question instances
      const res = await api.get(`/interviews/${interviewId}/summary`)
      const rounds = res.data.rounds || []
      const rnd = rounds.find(r => r.round_type === roundType)
      if (rnd) {
        const answered = (rnd.question_instances || []).filter(q => q.answer_text)
        setAnsweredInstances(answered)
        computeRoundPct(answered)
      } else {
        setAnsweredInstances([])
        setRoundPct(0)
      }
    } catch (err) {
      console.error('failed summary', err)
    }
  }

  const computeRoundPct = (answered) => {
    if (!answered.length) {
      setRoundPct(0)
      return
    }
    // convert each 1-5 score to 0-100 and average
    const avgScore = answered.reduce((s, qi) => s + (qi.score_1_5 || 1), 0) / answered.length
    const pct = ((avgScore - 1) / 4.0) * 100
    setRoundPct(Math.round(pct))
  }

  const handleSubmitAnswer = async () => {
    if (!currentQi) return
    setLoading(true)
    try {
      const payload = {
        question_instance_id: currentQi.id,
        answer_text: answerText
      }
      const res = await api.post(`/interviews/${interviewId}/answer`, payload)
      // push to answeredInstances
      setAnsweredInstances(prev => [...prev, res.data])
      computeRoundPct([...answeredInstances, res.data])
      // fetch next question
      await fetchNext()
    } catch (err) {
      console.error('failed submit', err)
      alert(err?.response?.data?.detail || 'Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseRound = async () => {
    if (!confirm('Close this round? This will compute final round score.')) return
    try {
      const res = await api.post(`/interviews/${interviewId}/round/${roundType}/close`)
      // refresh summary and show final result
      const final = res.data
      alert(`Round closed. Interview final %: ${final.final_pct || 'N/A'}`)
      // trigger parent refresh if needed
    } catch (err) {
      console.error(err)
      alert('Failed to close round')
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{roundType} Round</h2>
        <div className="text-sm">
          Live suitability: <strong>{roundPct}%</strong>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Answered: {answeredInstances.length}</div>
        <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
          <div className="h-3" style={{ width: `${roundPct}%`, background: '#4f46e5' }} />
        </div>
      </div>

      {currentQi ? (
        <>
          <div className="mb-2 text-sm font-medium">Question</div>
          <div className="p-4 bg-gray-50 rounded mb-4">
            {currentQi.asked_text}
          </div>

          <textarea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="w-full border rounded p-2 mb-3"
            placeholder="Type candidate's answer / notes here..."
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answerText.trim()}
              className="btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>

            <button onClick={() => { setAnswerText(''); }} className="btn-secondary">
              Clear
            </button>

            <button onClick={handleCloseRound} className="ml-auto btn-danger">
              Close Round
            </button>
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No more questions. You can close the round if ready.
        </div>
      )}
    </div>
  )
}
