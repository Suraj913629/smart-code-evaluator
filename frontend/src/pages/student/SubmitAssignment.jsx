import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const STARTER_CODE = {
  javascript: `// Write your solution function here
// Your main function MUST be named 'solution'

function solution() {
  // Write your code here
}`,
  python: `# Only JavaScript execution is supported
def solution():
    pass`,
  java: `// Only JavaScript execution is supported
public class Solution {
    public static Object solution() {
        return null;
    }
}`,
  cpp: `// Only JavaScript execution is supported
#include <iostream>
using namespace std;
`
}

const SubmitAssignment = () => {
  const { assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { fetchAssignment() }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const res = await api.get(`/assignments/${assignmentId}`)
      const a = res.data.assignment
      setAssignment(a)
      setLanguage(a.language || 'javascript')
      setCode(STARTER_CODE[a.language || 'javascript'])
    } catch (error) {
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(STARTER_CODE[lang])
  }

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Please write some code first')
    setSubmitting(true)
    setResult(null)
    try {
      const res = await api.post('/submissions', { assignmentId, code, language })
      setResult(res.data)
      console.log('Result data:', JSON.stringify(res.data))
      toast.success('Code submitted and evaluated!')
      if (res.data.newBadges?.length > 0) {
        res.data.newBadges.forEach(badge => toast.success(`🏆 Badge earned: ${badge.name}!`, { autoClose: 5000 }))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-5 shadow-sm mb-5">
          <h1 className="text-xl font-bold text-gray-800">{assignment?.title}</h1>
          <p className="text-gray-600 mt-2 text-sm whitespace-pre-line">{assignment?.description}</p>
          {assignment?.testCases?.filter(tc => tc.visible).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Sample Test Cases:</h3>
              <div className="space-y-2">
                {assignment.testCases.filter(tc => tc.visible).map((tc, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                    <span className="text-gray-500">Input: </span>
                    <span className="text-blue-700">{JSON.stringify(tc.input)}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="text-gray-500">Expected: </span>
                    <span className="text-green-700">{JSON.stringify(tc.expectedOutput)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
              <span className="text-sm font-medium">Code Editor</span>
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <Editor
              height="450px"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, lineNumbers: 'on', automaticLayout: true, scrollBeyondLastLine: false, wordWrap: 'on', tabSize: 2 }}
            />
            <div className="p-4 border-t">
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
                {submitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Evaluating...</>) : '🚀 Submit & Evaluate'}
              </button>
              {language !== 'javascript' && (
                <p className="text-xs text-yellow-600 text-center mt-2">⚠️ Only JavaScript test execution is supported</p>
              )}
            </div>
          </div>
          <div>
            {!result ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center h-full flex items-center justify-center">
                <div><p className="text-4xl mb-3">⏳</p><p className="text-gray-400">Submit your code to see results</p></div>
              </div>
            ) : (
              <ResultsPanel result={result} assignment={assignment} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ResultsPanel = ({ result, assignment }) => {
  const { evaluation } = result
  const [aiReview, setAiReview] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const statusColor = evaluation.status === 'CORRECT' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
  const gradeColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600' }
  const severityColor = { Critical: 'bg-red-100 text-red-700', Major: 'bg-orange-100 text-orange-700', Minor: 'bg-yellow-100 text-yellow-700' }
  const params = assignment?.parameters || {}
  const metrics = [
    { label: 'Lines of Code', key: 'loc', limit: params.maxLOC, higherIsBad: true },
    { label: 'Complexity', key: 'complexity', limit: params.maxComplexity, higherIsBad: true },
    { label: 'Comment Density', key: 'commentDensity', limit: params.minCommentDensity, higherIsBad: false, suffix: '%' },
    { label: 'Duplication', key: 'duplication', limit: params.maxDuplication, higherIsBad: true, suffix: '%' },
    { label: 'Function Length', key: 'functionLength', limit: params.maxFunctionLength, higherIsBad: true },
    { label: 'Nesting Depth', key: 'ifElseDepth', limit: params.maxIfElseDepth, higherIsBad: true },
    { label: 'Loops', key: 'loops', limit: params.maxLoops, higherIsBad: true },
  ]

  const getAIReview = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/review', { submissionId: result.submission.id })
      setAiReview(res.data.review)
    } catch (error) {
      toast.error('AI review failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">

      {/* Status + Score */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-4 py-2 rounded-full font-bold text-sm border ${statusColor}`}>
            {evaluation.status === 'CORRECT' ? '✅ CORRECT' : '❌ INCORRECT'}
          </span>
          <div className="text-right">
            <p className={`text-4xl font-bold ${gradeColor[evaluation.grade]}`}>{evaluation.grade}</p>
            <p className="text-gray-500 text-sm">Grade</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Quality Score</span>
            <span className="font-bold text-indigo-600">{evaluation.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full ${evaluation.score >= 75 ? 'bg-green-500' : evaluation.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${evaluation.score}%` }}></div>
          </div>
        </div>
      </div>

      {/* Test Cases */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Test Cases: {evaluation.testResults.passed}/{evaluation.testResults.total} Passed</h3>
        <div className="space-y-2">
          {evaluation.testResults.details.map((detail, i) => (
            <div key={i} className={`rounded-lg p-3 text-xs ${detail.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Test {i + 1}</span>
                <span className={`font-bold ${detail.passed ? 'text-green-600' : 'text-red-600'}`}>{detail.passed ? '✅ Pass' : '❌ Fail'}</span>
              </div>
              {detail.input !== 'Hidden' ? (
                <>
                  <p><span className="text-gray-500">Input: </span><code>{JSON.stringify(detail.input)}</code></p>
                  <p><span className="text-gray-500">Expected: </span><code>{JSON.stringify(detail.expectedOutput)}</code></p>
                  {!detail.passed && <p><span className="text-gray-500">Got: </span><code>{JSON.stringify(detail.actualOutput)}</code></p>}
                </>
              ) : <p className="text-gray-400 italic">Hidden test case</p>}
              {detail.error && <p className="text-red-600 mt-1">Error: {detail.error}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Code Quality Metrics</h3>
        <div className="space-y-3">
          {metrics.map(({ label, key, limit, higherIsBad, suffix = '' }) => {
            const value = evaluation.qualityMetrics[key] || 0
            const violated = higherIsBad ? value > limit : value < limit
            const pct = limit > 0 ? Math.min(100, (value / limit) * 100) : 0
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-medium ${violated ? 'text-red-600' : 'text-green-600'}`}>
                    {value}{suffix} / {higherIsBad ? 'max' : 'min'} {limit}{suffix}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${violated ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Violations */}
      {evaluation.violations?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3">Violations ({evaluation.violations.length})</h3>
          <div className="space-y-2">
            {evaluation.violations.map((v, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${severityColor[v.severity]}`}>{v.severity}</span>
                <p className="text-xs text-gray-700">{v.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {evaluation.suggestions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3">💡 Suggestions</h3>
          <ul className="space-y-2">
            {evaluation.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-indigo-400 flex-shrink-0">→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Badges */}
      {result.newBadges?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="font-semibold text-yellow-800 mb-3">🏆 New Badges Earned!</h3>
          {result.newBadges.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="font-medium text-yellow-800 text-sm">{b.name}</p>
                <p className="text-xs text-yellow-600">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Code Review */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">🤖 AI Code Review</h3>
          {!aiReview && (
            <button onClick={getAIReview} disabled={aiLoading}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-medium rounded-lg transition flex items-center gap-1">
              {aiLoading
                ? <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> Analyzing...</>
                : '✨ Get AI Review'}
            </button>
          )}
        </div>
        {!aiReview && !aiLoading && (
          <p className="text-xs text-gray-400">Click to get an AI-powered review of your code with specific suggestions.</p>
        )}
        {aiReview && (
          <div>
            <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-purple-50 rounded-lg p-4">
              {aiReview}
            </div>
            <button onClick={() => setAiReview(null)} className="mt-2 text-xs text-purple-600 hover:underline">
              Clear review
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default SubmitAssignment