import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  PlusCircle,
  Users,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function RoomSelectionPage() {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/room`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to create room.");
      }

      const data = await response.json();

      navigate(`/room/${data.roomId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    setError("");

    const id = roomIdInput.trim();

    if (!id) {
      setError("Please enter a Room ID.");
      return;
    }

    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

      {/* Hero */}

      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">

        <div className="max-w-7xl mx-auto px-8 py-20">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/20 px-5 py-2 rounded-lg hover:bg-white/30 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="mt-12 text-center">

            <h1 className="text-5xl font-bold">
              Mock Interview Room
            </h1>

            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Create a private interview room or join an existing one to
              practice coding and communication with your interview partner.
            </p>

          </div>

        </div>

      </section>

      {/* Cards */}

      <section className="max-w-7xl mx-auto px-8 py-16">

        <div className="grid lg:grid-cols-2 gap-10">

          {/* Create */}

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 hover:shadow-2xl transition">

            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">

              <PlusCircle
                className="text-blue-600"
                size={34}
              />

            </div>

            <h2 className="text-3xl font-bold mt-6">
              Create Interview Room
            </h2>

            <p className="text-gray-600 mt-4 leading-7">
              Generate a brand-new interview room instantly.
              Share the room ID with your friend and start
              your mock interview using live video and code
              collaboration.
            </p>

            <button
              onClick={createRoom}
              disabled={loading}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
            >
              {loading ? "Creating Room..." : "Create Room"}
            </button>

          </div>

          {/* Join */}

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 hover:shadow-2xl transition">

            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">

              <Users
                className="text-green-600"
                size={34}
              />

            </div>

            <h2 className="text-3xl font-bold mt-6">
              Join Existing Room
            </h2>

            <p className="text-gray-600 mt-4 leading-7">
              Already have a Room ID?
              Enter it below to join your friend's interview
              room instantly.
            </p>

            <input
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter Room ID"
              className="mt-8 w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={joinRoom}
              className="mt-6 w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-semibold transition"
            >
              Join Room
            </button>

          </div>

        </div>

        {/* Why MockMate */}

        <div className="mt-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12">

          <div className="flex items-center gap-4">

            <Sparkles
              className="text-purple-600"
              size={35}
            />

            <h2 className="text-3xl font-bold dark:text-white">
              Why Practice on MockMate?
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-10">

            <div>

              <Video
                className="text-blue-600 mb-3"
                size={35}
              />

              <h3 className="font-semibold text-xl dark:text-white">
                HD Video Calls
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Real-time peer interviews with crystal-clear
                audio and video.
              </p>

            </div>

            <div>

              <Users
                className="text-green-600 mb-3"
                size={35}
              />

              <h3 className="font-semibold text-xl dark:text-white">
                Peer Collaboration
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Practice with classmates and friends just like
                a real interview.
              </p>

            </div>

            <div>

              <Sparkles
                className="text-purple-600 mb-3"
                size={35}
              />

              <h3 className="font-semibold text-xl dark:text-white">
                Interview Ready
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Improve confidence, communication, and coding
                before your dream company interview.
              </p>

            </div>

          </div>

        </div>

        {error && (
          <div className="mt-10 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

      </section>

    </div>
  );
}