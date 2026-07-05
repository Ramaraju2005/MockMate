export default function InterviewReport({ report, onRestart, onSave, saving, saveStatus }) {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Interview Report</h2>
            <p className="text-gray-600 dark:text-slate-400">AI-generated feedback for each answer.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onSave && (
              <button type="button" onClick={onSave} disabled={saving} className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button type="button" onClick={onRestart} className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
              Start New Interview
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
            {saveStatus}
          </div>
        )}

        <div className="space-y-6">
          {report.map((item, index) => (
            <div key={`${item.question}-${index}`} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{index + 1}. {item.question}</h3>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Score: {item.overallScore ?? item.score ?? 'N/A'}/100
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Student Answer</p>
                  <p className="rounded-2xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-750 dark:text-slate-200 border border-slate-100 dark:border-slate-850">{item.studentAnswer || 'No answer recorded.'}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Ideal Answer</p>
                  <p className="rounded-2xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-750 dark:text-slate-200 border border-slate-100 dark:border-slate-850">{item.idealAnswer || 'Not available.'}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Accuracy Score</p>
                  <p className="rounded-2xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-750 dark:text-slate-200 border border-slate-100 dark:border-slate-850">{item.accuracyScore ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Communication Score</p>
                  <p className="rounded-2xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-750 dark:text-slate-200 border border-slate-100 dark:border-slate-850">{item.communicationScore ?? 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Improvement Suggestion</p>
                <p className="rounded-2xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-750 dark:text-slate-200 border border-slate-100 dark:border-slate-850">{item.improvementSuggestion || 'Keep practicing.'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
