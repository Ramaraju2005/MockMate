import { useContext, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

import socket from "../socket/socket";
import { compile } from "../services/compiler";
import { ThemeContext } from "../context/ThemeContext";

const BOILERPLATES = {
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello MockMate");
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello MockMate" << endl;
    return 0;
}`,
  python: `def main():
    print("Hello MockMate")

if __name__ == "__main__":
    main()`,
};

export default function CodeEditorPanel({ onOutput, roomId, onSave, onCodeChange, isInterviewee, onToggleRole }) {
  const { theme } = useContext(ThemeContext);
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState(BOILERPLATES["java"]);
  const [isMobile] = useState(() => {
    if (typeof navigator === "undefined") return false;
    const mobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );
    return mobile || (typeof window !== "undefined" && window.innerWidth <= 768);
  });

  const [running, setRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const debounceRef = useRef(null);
  const remoteUpdate = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    // RoomPage handles the room join centrally.
  }, [roomId]);

  useEffect(() => {
    if (typeof onCodeChange === "function") {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);

  useEffect(() => {
    socket.on("code-update", (newCode) => {
      remoteUpdate.current = true;
      setCode(newCode);
      if (typeof onCodeChange === "function") {
        onCodeChange(newCode);
      }
    });

    return () => {
      socket.off("code-update");
    };
  }, [onCodeChange]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    // Set boilerplate code for the selected language
    const boilerplate = BOILERPLATES[lang] || "";
    setCode(boilerplate);
    if (typeof onCodeChange === "function") {
      onCodeChange(boilerplate);
    }
    if (roomId) {
      socket.emit("language-change", { roomId, language: lang });
      socket.emit("code-change", { roomId, code: boilerplate });
    }
  };

  useEffect(() => {
    socket.on("language-update", (lang) => {
      setLanguage(lang);
    });

    return () => {
      socket.off("language-update");
    };
  }, []);

  const runCode = async () => {
    setRunning(true);
    const runningMessage = "Running...";
    if (typeof onOutput === "function") onOutput(runningMessage);

    try {
      const result = await compile(language, code, "");

      let out = "";
      if (result.output) {
        out = result.output;
      } else if (result.error) {
        out = result.error;
      } else {
        out = JSON.stringify(result, null, 2);
      }

      if (typeof onOutput === "function") onOutput(out);
      if (roomId) {
        socket.emit("console-output", { roomId, output: out });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = "Compilation Error";
      if (typeof onOutput === "function") onOutput(errorMessage);
      if (roomId) {
        socket.emit("console-output", { roomId, output: errorMessage });
      }
    } finally {
      setRunning(false);
    }
  };

  const handleCodeChange = (value) => {
    const nextCode = value || "";
    setCode(nextCode);
    if (typeof onCodeChange === "function") {
      onCodeChange(nextCode);
    }

    if (remoteUpdate.current) {
      remoteUpdate.current = false;
      return;
    }

    if (!roomId) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket.emit("code-change", {
        roomId,
        code: nextCode,
      });
    }, 150);
  };

  const languageMap = {
    java: "java",
    cpp: "cpp",
    python: "python",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col h-full min-h-0 transition-colors">
      <div className="border-b border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between bg-white dark:bg-slate-800 transition-colors">
        <div className="flex gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Role:
            </span>
            <button
              type="button"
              onClick={() => {
                if (typeof onToggleRole === "function") {
                  onToggleRole(!isInterviewee);
                }
              }}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {isInterviewee ? "Interviewee" : "Interviewer"}
            </button>
          </div>

          <button
            onClick={runCode}
            disabled={running}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg disabled:opacity-60"
          >
            {running ? "Running..." : "Run"}
          </button>
          <button
            onClick={async () => {
              if (typeof onSave === "function") {
                setSaveStatus("Saving...");
                const saveResult = await onSave();
                setSaveStatus(saveResult || "Saved successfully");
              }
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Save
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {saveStatus || "Save status will appear here"}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isMobile ? (
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-full min-h-70 rounded-b-xl resize-none border-0 bg-slate-950 p-4 text-sm font-mono leading-6 text-slate-100 outline-none"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            inputMode="text"
          />
        ) : (
          <Editor
            height="100%"
            theme={theme === "dark" ? "vs-dark" : "light"}
            language={languageMap[language]}
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </div>

      {/* OutputConsole moved to RoomPage */}
    </div>
  );
}
