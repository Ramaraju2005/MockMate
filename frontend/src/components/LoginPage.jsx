export default function LoginPage({ onLogin, error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">MockMate</h1>
        <p className="text-gray-600 mb-8">Master your interview skills</p>

        <p className="mb-6 text-gray-700">Sign in to start your interview preparation journey.</p>
        <button
          className="w-full px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          onClick={onLogin}
          type="button"
        >
          <span>🔐</span>
          Continue with Google
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
