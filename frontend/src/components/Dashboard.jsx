import React from "react";
import { useNavigate } from "react-router-dom";
import About from "./About.jsx";
import Footer from "./Footer.jsx";
import {
  Video,
  Bot,
  FileText,
  ArrowRight
} from "lucide-react";


export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dark:bg-gray-900 min-h-screen transition-colors">

      {/* Hero Section */}

      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-24">

        <div className="max-w-7xl mx-auto px-8">

          <h1 className="text-6xl font-bold">
            Ace Your Next Interview
          </h1>

          <p className="mt-6 text-xl text-blue-100 max-w-2xl">
            Practice interviews with peers, AI-powered interviewers, and
            resume-based mock interviews — all in one place.
          </p>

          <button
            onClick={() => navigate("/room-selection")}
            className="mt-10 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:scale-105 transition flex items-center gap-2"
          >
            Start Practicing
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features */}

      <section className="py-20 bg-gray-100 dark:bg-gray-900 transition-colors">

        <div className="max-w-7xl mx-auto px-8">

          <h2 className="text-4xl font-bold text-center mb-16 dark:text-white">
            Our Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            {/* Card 1 */}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition p-8">

              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Video className="text-blue-600" size={30} />
              </div>

              <h3 className="text-2xl font-bold mb-4 dark:text-white">
                Video Interview with Peer
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join live video interviews with friends or peers to improve
                communication, confidence and coding skills.
              </p>

              <button
                onClick={() => navigate("/room-selection")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
              >
                Start Room Selection
                <ArrowRight size={18} />
              </button>

            </div>

            {/* Card 2 */}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition p-8">

              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Bot className="text-purple-600" size={30} />
              </div>

              <h3 className="text-2xl font-bold mb-4 dark:text-white">
                Interview with AI
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Practice technical and HR interviews with an intelligent AI
                interviewer available anytime.
              </p>

            </div>

            {/* Card 3 */}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition p-8">

              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <FileText className="text-green-600" size={30} />
              </div>

              <h3 className="text-2xl font-bold mb-4 dark:text-white">
                Resume Interview
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Upload your resume and receive interview questions generated
                specifically from your projects, skills and experience.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* About */}

     

     <About />
     <Footer />

    </div>
  );
}