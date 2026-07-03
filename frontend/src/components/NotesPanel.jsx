import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import socket from "../socket/socket";

export default function NotesPanel({ roomId, onNotesChange }) {

    const [notes, setNotes] = useState("");

    const debounceRef = useRef(null);

    const remoteUpdate = useRef(false);

    useEffect(() => {
    if (!roomId) return;

    // RoomPage will handle the room join centrally.
  }, [roomId]);

    useEffect(() => {

        socket.on("notes-update", (newNotes) => {

            remoteUpdate.current = true;
            setNotes(newNotes);
            if (typeof onNotesChange === "function") {
                onNotesChange(newNotes);
            }

        });

        return () => {

            socket.off("notes-update");

        };

    }, [onNotesChange]);

    const handleChange = (e) => {

        const value = e.target.value;

        setNotes(value);
        if (typeof onNotesChange === "function") {
            onNotesChange(value);
        }

        if (remoteUpdate.current) {

            remoteUpdate.current = false;

            return;

        }

        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {

            socket.emit("notes-change", {

                roomId,

                notes: value,

            });

        }, 150);

    };

    return (

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow h-full flex flex-col transition-colors">

            <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-2">

                <FileText size={20}/>

                <h2 className="font-semibold text-slate-900 dark:text-slate-100">

                    Interview Notes

                </h2>

            </div>

            <textarea

                value={notes}

                onChange={handleChange}

                placeholder="Write notes..."

                className="flex-1 resize-none outline-none p-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"

            />

        </div>

    );

}