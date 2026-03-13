import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const PeerReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ rating: 5, feedback: '', codeReadability: 5, logicClarity: 5, bestPractices: 5 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    try {
      const res = await api.get('/peer-reviews/my')
      setReviews(res.data.reviews)
    } catch (error) {
      toast.error('Failed to load peer reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (reviewId) => {
    if (!form.feedback.trim()) return toast.error('Please write some feedback')
    setSubmitting(true)
    try {
      await api.put(`/peer-reviews/${reviewId}/submit`, form)
      toast.success('Review submitted successfully!')
      setSelected(null)
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-3">
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => onChange(star)}
            className={`text-2xl transition ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 Peer Reviews</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500">No peer reviews assigned yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your faculty will assign peer reviews after submissions close.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Reviews list */}
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review._id}
                  onClick={() => !review.completed && setSelected(review)}
                  className={`bg-white rounded-xl p-5 shadow-sm border-2 transition ${
                    review.completed ? 'border-green-200 opacity-75' :
                    selected?._id === review._id ? 'border-indigo-500 cursor-pointer' : 'border-transparent hover:border-indigo-200 cursor-pointer'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{review.assignmentId?.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${review.completed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {review.completed ? '✅ Done' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Review code by: <span className="font-medium text-gray-700">{review.revieweeId?.name}</span></p>
                  <p className="text-xs text-gray-400 mt-1">Batch: {review.revieweeId?.batch}</p>
                  {review.completed && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                    </div>
                  )}
                  {!review.completed && (
                    <p className="text-xs text-indigo-500 mt-2">Click to write review →</p>
                  )}
                </div>
              ))}
            </div>

            {/* Review form */}
            {selected ? (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-700 mb-1">Write Review</h2>
                <p className="text-sm text-gray-500 mb-4">Reviewing: <span className="font-medium">{selected.revieweeId?.name}</span></p>

                {/* Code preview */}
                {selected.submissionId?.code && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">Their Code:</p>
                    <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto max-h-32 overflow-y-auto">
                      {selected.submissionId.code}
                    </pre>
                  </div>
                )}

                <StarRating label="Overall Rating" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                <StarRating label="Code Readability" value={form.codeReadability} onChange={(v) => setForm({ ...form, codeReadability: v })} />
                <StarRating label="Logic Clarity" value={form.logicClarity} onChange={(v) => setForm({ ...form, logicClarity: v })} />
                <StarRating label="Best Practices" value={form.bestPractices} onChange={(v) => setForm({ ...form, bestPractices: v })} />

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Written Feedback *</label>
                  <textarea
                    value={form.feedback}
                    onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                    rows={4}
                    placeholder="Write constructive feedback about their code..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleSubmitReview(selected._id)} disabled={submitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition text-sm">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center flex items-center justify-center">
                <div>
                  <p className="text-3xl mb-2">👆</p>
                  <p className="text-gray-400 text-sm">Click a pending review to start</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PeerReviews