import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const ViewSubmissions = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => { fetchSubmissions() }, [id])

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/submissions/assignment/${id}`)
      setSubmissions(res.data.submissions)
    } catch (error) {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPeerReviews = async () => {
    setAssigning(true)
    try {
      const res = await api.post('/peer-reviews/assign', { assignmentId: id })
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign peer reviews')
    } finally {
      setAssigning(false)
    }
  }

  const severityColor = {
    Critical: 'bg-red-100 text-red-700',
    Major: 'bg-orange-100 text-orange-700',
    Minor: 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
            <h1 className="text-2xl font-bold text-gray-800">All Submissions</h1>
          </div>
          <button
            onClick={handleAssignPeerReviews}
            disabled={assigning || submissions.length < 2}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition"
          >
            {assigning ? 'Assigning...' : '👥 Assign Peer Reviews'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub._id} onClick={() => setSelected(sub)}
                  className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition hover:shadow-md border-2 ${selected?._id === sub._id ? 'border-indigo-500' : 'border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{sub.studentId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{sub.studentId?.email} · v{sub.version} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    {sub.evaluation && (
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{sub.evaluation.score}/100</p>
                        <p className={`text-xs font-medium ${sub.evaluation.status === 'CORRECT' ? 'text-green-600' : 'text-red-600'}`}>
                          {sub.evaluation.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selected ? (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <h2 className="font-semibold text-gray-700">{selected.studentId?.name}'s Submission</h2>
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Code (v{selected.version})</p>
                  <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto max-h-48 overflow-y-auto">
                    {selected.code}
                  </pre>
                </div>
                {selected.evaluation && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${selected.evaluation.status === 'CORRECT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selected.evaluation.status}
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{selected.evaluation.score}/100</p>
                        <p className="text-xs text-gray-500">Grade: {selected.evaluation.grade}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Quality Metrics</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(selected.evaluation.qualityMetrics || {}).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 rounded px-2 py-1 flex justify-between">
                            <span className="text-gray-500 capitalize">{key}</span>
                            <span className="font-medium">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selected.evaluation.violations?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Violations</p>
                        <div className="space-y-1">
                          {selected.evaluation.violations.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${severityColor[v.severity]}`}>{v.severity}</span>
                              <span className="text-gray-600">{v.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center flex items-center justify-center">
                <div>
                  <p className="text-3xl mb-2">👆</p>
                  <p className="text-gray-400 text-sm">Click a submission to view details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewSubmissions