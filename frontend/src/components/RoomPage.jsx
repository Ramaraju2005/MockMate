import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Room,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "livekit-client";

import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import InterviewNavbar from "./InterviewNavbar";
import NotesPanel from "./NotesPanel";
import CodeEditorPanel from "./CodeEditorPanel";
import OutputConsole from "./OutputConsole";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [remoteCount, setRemoteCount] = useState(0);
  const [participants, setParticipants] = useState(1);
  const [timerStart, setTimerStart] = useState(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (timerStart === null) return;

    const interval = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((Date.now() - timerStart) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStart]);

  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const [editorOutput, setEditorOutput] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [notesText, setNotesText] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [isInterviewee, setIsInterviewee] = useState(true);
  const { user } = useAuth();
  const roomRef = useRef(null);

  const localVideoRef = useRef(null);

  const remoteContainerRef = useRef(null);

  const localTracksRef = useRef({
    audio: null,
    video: null,
  });

  const remoteAudioEls = useRef([]);

  useEffect(() => {
    if (!roomId) return;

    const userName = user?.displayName || user?.name || "Guest";
    socket.emit("join-room", {
      roomId,
      userName,
    });
  }, [roomId, user?.displayName, user?.name]);

  const saveInterview = async () => {
    if (!roomId) return "Save failed: missing room";
    if (!user) return "Save failed: not authenticated";

    const durationSeconds = timerStart ? Math.floor((Date.now() - timerStart) / 1000) : 0;
    const selfName = user.displayName || user.name || "Guest";
    const otherName = otherUserName || selfName;
    const interviewerName = isInterviewee ? otherName : selfName;
    const intervieweeName = isInterviewee ? selfName : otherName;

    try {
      const response = await fetch(`${API_URL || ""}/api/session/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: String(roomId || ""),
          interviewerName: String(interviewerName || "Unknown"),
          intervieweeName: String(intervieweeName || "Unknown"),
          interviewDate: new Date().toISOString(),
          durationSeconds: Number(durationSeconds || 0),
          editorText: String(notesText || ""),
          code: String(codeContent || ""),
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        if (contentType.includes("application/json")) {
          const data = await response.json().catch(() => ({}));
          return `Save failed: ${data.error || "Server error"}`;
        }
        const text = await response.text();
        return `Save failed: ${text.slice(0, 120)}`;
      }

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        return `Save failed: invalid server response: ${text.slice(0, 120)}`;
      }

      const data = await response.json().catch(() => ({}));
      return `Saved: ${data.sessionId || "unknown"}`;
    } catch (err) {
      return `Save failed: ${err.message}`;
    }
  };

  useEffect(() => {
    if (!roomId) return;

    socket.on("participants", (count) => {
      setParticipants(count);
    });

    socket.on("timer-start", (startTime) => {
      setTimerStart(startTime);
      setSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    });

    socket.on("room-users", (users) => {
      const others = users.filter((name) => name !== (user?.displayName || user?.name));
      setOtherUserName(others[0] || "");
    });

    socket.on("console-output", (output) => {
      setEditorOutput(output);
    });

    const setup = async () => {
      try {
        const tokenRes = await fetch(
          `${API_URL}/api/livekit/token?room=${encodeURIComponent(roomId)}`,
          { credentials: "include" }
        );

        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to fetch LiveKit token.");
        }

        const { token, url } = await tokenRes.json();
        if (!token) throw new Error("Invalid token received.");

        const room = new Room();
        await room.connect(url || window.location.origin, token);
        roomRef.current = room;

        const videoTrack = await createLocalVideoTrack();
        const audioTrack = await createLocalAudioTrack();

        localTracksRef.current = {
          video: videoTrack,
          audio: audioTrack,
        };

        const localContainer = localVideoRef.current;
        if (localContainer) {
          localContainer.innerHTML = "";
          const localEl = videoTrack.attach();
          localEl.style.width = "100%";
          localEl.style.height = "100%";
          localEl.style.objectFit = "cover";
          localContainer.appendChild(localEl);
        }

        await room.localParticipant.publishTrack(videoTrack);
        await room.localParticipant.publishTrack(audioTrack);

        const handleTrack = (track) => {
          if (track.kind === "video") {
            const videoEl = track.attach();
            videoEl.style.width = "100%";
            videoEl.style.height = "100%";
            videoEl.style.objectFit = "cover";

            if (remoteContainerRef.current) {
              remoteContainerRef.current.innerHTML = "";
              remoteContainerRef.current.appendChild(videoEl);
            }
            setRemoteCount(1);
          } else if (track.kind === "audio") {
            const audioEl = track.attach();
            audioEl.style.display = "none";
            document.body.appendChild(audioEl);
            remoteAudioEls.current.push(audioEl);
          }
        };

        room.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (publication.track) {
              handleTrack(publication.track);
            }
          });
        });

        room.on("trackSubscribed", handleTrack);

        room.on("trackUnsubscribed", (track) => {
          track.detach().forEach((el) => el.remove());
          if (track.kind === "video" && remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = "";
          }
        });

        room.on("participantDisconnected", () => {
          if (remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = "";
          }
          remoteAudioEls.current.forEach((el) => el.remove());
          remoteAudioEls.current = [];
          setRemoteCount(0);
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to join room");
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      socket.off("participants");
      socket.off("timer-start");
      socket.off("room-users");
      socket.off("console-output");

      try {
        if (localTracksRef.current.video) {
          localTracksRef.current.video.stop();
          localTracksRef.current.video.detach().forEach((el) => el.remove());
        }

        if (localTracksRef.current.audio) {
          localTracksRef.current.audio.stop();
        }

        if (roomRef.current) {
          roomRef.current.disconnect();
        }

        remoteAudioEls.current.forEach((el) => el.remove());
        remoteAudioEls.current = [];
      } catch (err) {
        console.error(err);
      }
    };
  }, [roomId, user?.displayName, user?.name]);

  const toggleMic = async () => {

    const audioTrack = localTracksRef.current.audio;

    if (!audioTrack) return;

    if (micMuted) {
      await audioTrack.unmute();
    } else {
      await audioTrack.mute();
    }

    setMicMuted((prev) => !prev);
  };

  const toggleCam = async () => {
        const videoTrack = localTracksRef.current.video;

    if (!videoTrack) return;

    if (camOff) {
      await videoTrack.unmute();
    } else {
      await videoTrack.mute();
    }

    setCamOff((prev) => !prev);
  };

  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex flex-col overflow-auto transition-colors">

      <InterviewNavbar
        roomId={roomId}
        onLeave={() => navigate("/")}
      />

      <div className="flex-1 p-4 space-y-4 overflow-auto dark:text-slate-100">

        {/* ================= VIDEO PANEL ================= */}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 transition-colors">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Live Interview
              </h2>

              <p className="text-gray-500 dark:text-slate-400 text-sm">
                Room : {roomId}
              </p>

            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold">⏱ {formatTime(seconds)}</span>
              <button
                type="button"
                onClick={() => socket.emit("start-timer", roomId)}
                disabled={timerStart !== null}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                  timerStart !== null
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {timerStart !== null ? "Timer Running" : "Start Timer"}
              </button>
              <div className="font-medium text-green-600">
                {remoteCount === 0 ? (
                  "Waiting for Interviewer..."
                ) : (
                  `${participants} Participant${participants > 1 ? "s" : ""} Connected`
                )}
              </div>
            </div>

          </div>
                    <div className="grid grid-cols-2 gap-5">

            {/* Local Video */}

            <div className="rounded-2xl bg-black overflow-hidden relative">

              <div
                ref={localVideoRef}
                className="h-60"
              />

              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                You {micMuted ? "🔇" : "🎙"}
              </div>

            </div>

            {/* Remote Video */}

            <div className="rounded-2xl bg-black overflow-hidden relative">

              <div
                ref={remoteContainerRef}
                className="h-60"
              />

              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                Interviewer
              </div>

            </div>

          </div>

          <div className="flex justify-center gap-4 mt-5">

            <button
              onClick={toggleMic}
              className={`px-5 py-2 rounded-xl font-medium transition ${
                micMuted
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              {micMuted ? "Unmute Mic" : "Mute Mic"}
            </button>

            <button
              onClick={toggleCam}
                            className={`px-5 py-2 rounded-xl font-medium transition ${
                camOff
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              {camOff ? "Turn On Camera" : "Turn Off Camera"}
            </button>

          </div>

          {loading && (
            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-blue-700">
              Joining interview room...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-600">
              {error}
            </div>
          )}

        </div>

        {/* ================= WORKSPACE ================= */}
        <Group direction="horizontal" className="flex-1 rounded-2xl overflow-hidden min-h-0">
          <Panel defaultSize={25} minSize={20}>
            <div className="flex flex-col h-full min-h-0">
              <div className="h-48">
                <OutputConsole output={editorOutput} />
              </div>
              <div className="flex flex-col h-full min-h-0">
                <NotesPanel roomId={roomId} onNotesChange={setNotesText} />
              </div>
            </div>
          </Panel>
          <Separator className="w-2 bg-slate-300 hover:bg-blue-500 transition" />
          <Panel defaultSize={75}>
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-1 min-h-0">
                <CodeEditorPanel
                  onOutput={setEditorOutput}
                  roomId={roomId}
                  isInterviewee={isInterviewee}
                  onToggleRole={setIsInterviewee}
                  onCodeChange={setCodeContent}
                  onSave={saveInterview}
                />
              </div>
            </div>
          </Panel>
        </Group>

      </div>

     

    </div>

  );

}