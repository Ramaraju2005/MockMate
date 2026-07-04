export default function CodingInterviewReport({ report, onRestart, onSave, saving, saveStatus }) {
  const average = (values) => {
    const valid = values.filter((value) => Number.isFinite(value))
    if (!valid.length) return 'N/A'
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
  }

  const formatCodeText = (text) => {
    const content = String(text || '').trim()
    if (!content) return ''

    if (content.includes('\n')) {
      return content
    }

    return content
      .replace(/\s*\{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n')
      .replace(/\n\s*\}/g, '\n}')
      .replace(/\n{3,}/g, '\n\n')
  }

  const communicationScore = average(report.map((item) => item.communicationScore))
  const codeQualityScore = average(report.map((item) => item.codingScore))
  const overallScore = average(report.map((item) => item.overallScore))

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-8 transition-colors">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Coding Interview Report</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Communication, code quality, and overall outcome.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onSave} disabled={saving} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onRestart} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              Start New Interview
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
            {saveStatus}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Communication Skills</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{communicationScore}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Code Quality</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{codeQualityScore}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Overall Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{overallScore}/100</p>
          </div>
        </div>

        <div className="space-y-4">
          {report.map((item, index) => (
            <div key={`${item.question}-${index}`} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{index + 1}. {item.question}</h3>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">{item.overallScore ?? 'N/A'}/100</div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Your Code</p>
                  <pre className="mt-1 overflow-x-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-sm font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">{item.code || 'No code submitted.'}</pre>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Optimal Code / Approach</p>
                  <pre className="mt-1 min-h-40 overflow-x-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-sm font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-6">{formatCodeText(item.optimizedSolution) || 'No optimized solution available yet.'}</pre>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Communication Feedback</p>
                  <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{item.conversationEvaluation || 'The candidate explained their approach clearly and stayed engaged in the conversation.'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Code Quality Feedback</p>
                  <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">{item.codeEvaluation || 'No code review available.'}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Time: {item.timeComplexity || 'N/A'}</span>
                <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Space: {item.spaceComplexity || 'N/A'}</span>
                <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Suggestions: {item.improvements || 'Keep practicing.'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
