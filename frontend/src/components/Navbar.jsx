export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MockMate</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.name}</span>
            {user.photo && (
              <img
                className="w-8 h-8 rounded-full"
                src={user.photo}
                alt={user.name}
              />
            )}
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
