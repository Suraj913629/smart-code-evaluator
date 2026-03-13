import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const CreateAssignment = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', deadline: '', language: 'javascript', batch: '' })
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', visible: true }])
  const [parameters, setParameters] = useState({ maxLOC: 100, maxComplexity: 10, maxFunctionLength: 50, maxIfElseDepth: 3, maxLoops: 5, minCommentDensity: 10, maxDuplication: 15 })
  const [weightage, setWeightage] = useState({ complexity: 40, codeLength: 20, comments: 15, duplication: 25 })

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleParamChange = (e) => setParameters({ ...parameters, [e.target.name]: Number(e.target.value) })
  const handleWeightChange = (e) => setWeightage({ ...weightage, [e.target.name]: Number(e.target.value) })
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases]
    updated[index][field] = value
    setTestCases(updated)
  }
  const addTestCase = () => {
    if (testCases.length >= 5) return toast.warning('Maximum 5 test cases allowed')
    setTestCases([...testCases, { input: '', expectedOutput: '', visible: true }])
  }
  const removeTestCase = (index) => {
    if (testCases.length <= 1) return toast.warning('At least 1 test case required')
    setTestCases(testCases.filter((_, i) => i !== index))
  }
  const parseValue = (str) => { try { return JSON.parse(str) } catch { return str } }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const weightSum = Object.values(weightage).reduce((a, b) => a + b, 0)
    if (weightSum !== 100) return toast.error(`Weightage must sum to 100. Current: ${weightSum}`)
    for (let i = 0; i < testCases.length; i++) {
      if (!testCases[i].input || !testCases[i].expectedOutput) return toast.error(`Test case ${i + 1} is incomplete`)
    }
    setLoading(true)
    try {
      await api.post('/assignments', {
        ...form,
        testCases: testCases.map(tc => ({ input: parseValue(tc.input), expectedOutput: parseValue(tc.expectedOutput), visible: tc.visible })),
        parameters, weightage
      })
      toast.success('Assignment created successfully!')
      navigate('/faculty')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const weightSum = Object.values(weightage).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Create Assignment</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">📋 Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" value={form.title} onChange={handleFormChange} required placeholder="e.g. Two Sum Problem" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} required rows={4} placeholder="Describe the problem..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleFormChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select name="language" value={form.language} onChange={handleFormChange} className={inputClass}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                <input name="batch" value={form.batch} onChange={handleFormChange} required placeholder="e.g. CSE-A" className={inputClass} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">🧪 Test Cases</h2>
              <button type="button" onClick={addTestCase} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium">+ Add</button>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-xs text-blue-700">
              <strong>Tip:</strong> Input must be valid JSON. Example: <code>[[2,7,11], 9]</code> for multiple args, <code>[0,1]</code> for array output.
            </div>
            <div className="space-y-4">
              {testCases.map((tc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Test Case {index + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input type="checkbox" checked={tc.visible} onChange={(e) => handleTestCaseChange(index, 'visible', e.target.checked)} />
                        Visible to student
                      </label>
                      {testCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(index)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Input (JSON)</label>
                      <input value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} placeholder='e.g. [[2,7,11], 9]' className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Expected Output (JSON)</label>
                      <input value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)} placeholder='e.g. [0,1]' className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-4">⚙️ Quality Parameters</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Max Lines of Code', name: 'maxLOC' },
                { label: 'Max Complexity', name: 'maxComplexity' },
                { label: 'Max Function Length', name: 'maxFunctionLength' },
                { label: 'Max If/Else Depth', name: 'maxIfElseDepth' },
                { label: 'Max Loops', name: 'maxLoops' },
                { label: 'Min Comment Density (%)', name: 'minCommentDensity' },
                { label: 'Max Duplication (%)', name: 'maxDuplication' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="text-xs text-gray-600 mb-1 block">{label}</label>
                  <input type="number" name={name} value={parameters[name]} onChange={handleParamChange} min="0" className={inputClass} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-1">⚖️ Score Weightage</h2>
            <p className="text-xs text-gray-400 mb-4">Must sum to 100. Current: <span className={weightSum === 100 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{weightSum}</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Complexity (%)', name: 'complexity' },
                { label: 'Code Length (%)', name: 'codeLength' },
                { label: 'Comments (%)', name: 'comments' },
                { label: 'Duplication (%)', name: 'duplication' },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="text-xs text-gray-600 mb-1 block">{label}</label>
                  <input type="number" name={name} value={weightage[name]} onChange={handleWeightChange} min="0" max="100" className={inputClass} />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition">
            {loading ? 'Creating...' : '🚀 Create Assignment'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateAssignment