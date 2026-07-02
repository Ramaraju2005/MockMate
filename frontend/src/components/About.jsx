import { Users, Bot, FileText, Target } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="bg-white dark:bg-gray-900 py-24 transition-colors">
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}

        <div className="text-center">

          <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
            About MockMate
          </h2>

          <div className="w-28 h-1 bg-blue-600 mx-auto rounded-full mt-5"></div>

          <p className="mt-8 text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-8">
            MockMate is an interview preparation platform designed for
            students and job seekers to gain confidence before their
            real interviews. Whether you're preparing with a friend,
            an AI interviewer, or through resume-based questions,
            MockMate provides a realistic interview experience in one place.
          </p>

        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">

          <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition">

            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto">

              <Users className="text-white" size={30} />

            </div>

            <h3 className="text-xl font-semibold mt-6 dark:text-white">
              Peer Interviews
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Conduct live mock interviews with your friends and improve your communication skills.
            </p>

          </div>

          <div className="bg-purple-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition">

            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto">

              <Bot className="text-white" size={30} />

            </div>

            <h3 className="text-xl font-semibold mt-6 dark:text-white">
              AI Interview
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Practice technical and HR interviews anytime with our AI-powered interviewer.
            </p>

          </div>

          <div className="bg-green-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition">

            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto">

              <FileText className="text-white" size={30} />

            </div>

            <h3 className="text-xl font-semibold mt-6 dark:text-white">
              Resume Analysis
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Upload your resume and receive interview questions based on your experience.
            </p>

          </div>

          <div className="bg-orange-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:shadow-xl transition">

            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto">

              <Target className="text-white" size={30} />

            </div>

            <h3 className="text-xl font-semibold mt-6 dark:text-white">
              Interview Ready
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Improve confidence, communication, and problem-solving before your dream interview.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}