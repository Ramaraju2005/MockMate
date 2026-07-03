export default function CodingInterviewReport({ report, onRestart }) {
  const average = (values) => {
    const valid = values.filter((value) => Number.isFinite(value))
    if (!valid.length) return 'N/A'
    return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Coding Interview Report</h2>
            <p className="text-slate-600 dark:text-slate-400">Review every problem, execution result, and AI evaluation.</p>
          </div>
          <button type="button" onClick={onRestart} className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Start New Interview
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Overall Coding Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{average(report.map((item) => item.codingScore))}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Communication Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{average(report.map((item) => item.communicationScore))}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Problem Solving Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{average(report.map((item) => item.problemSolvingScore))}/100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Overall Interview Score</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{average(report.map((item) => item.overallScore))}/100</p>
          </div>
        </div>

        <div className="space-y-6">
          {report.map((item, index) => (
            <div key={`${item.question}-${index}`} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{index + 1}. {item.question}</h3>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">Overall: {item.overallScore ?? 'N/A'}/100</div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">Problem Statement</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{item.problemStatement || 'No statement available.'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">User Code</p>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">{item.code || 'No code submitted.'}</pre>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">Execution Result</p>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">{item.executionResult || 'No execution output.'}</pre>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">AI Evaluation</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.evaluation || 'No evaluation available.'}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">Suggested Optimized Solution</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">{item.optimizedSolution || 'No optimized solution available yet.'}</pre>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-medium">Time Complexity</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.timeComplexity || 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-medium">Space Complexity</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.spaceComplexity || 'N/A'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-medium">Improvement Suggestions</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.improvements || 'Keep practicing.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
