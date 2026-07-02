import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Website Name */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              MockMate
            </h2>
            <p className="text-gray-400 mt-2">
              Practice. Prepare. Perform.
            </p>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2">
            <Mail size={18} />
            <span>mockmate@gmail.com</span>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-8 pt-5 text-center text-sm text-gray-400">
          © 2026 MockMate. All Rights Reserved...
        </div>
      </div>
    </footer>
  );
}