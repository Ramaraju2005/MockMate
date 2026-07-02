export default function Dashboard({ user, onStartPractice, onStartInterview, onStartCodingInterview }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-10">Start preparing for your interview</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Practice Interview</h3>
            <p className="text-gray-600 mb-6">
              Engage in realistic mock interviews with Agora video and audio.
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                type="button"
                onClick={onStartPractice}
              >
                Start Practice
              </button>
              <button
                className="w-full px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
                type="button"
                onClick={onStartInterview}
              >
                AI Mock Interview
              </button>
              <button
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                type="button"
                onClick={onStartCodingInterview}
              >
                Coding Interview MVP
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">View Results</h3>
            <p className="text-gray-600 mb-6">
              Track your progress, view detailed analytics, and understand your strengths and weaknesses.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Prep Guide</h3>
            <p className="text-gray-600 mb-6">
              Access curated resources, tips, and common interview questions to prepare effectively.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
