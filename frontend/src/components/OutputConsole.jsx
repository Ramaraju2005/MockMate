export default function OutputConsole({ output }) {

    return (

        <div className="bg-[#1e1e1e] text-white h-52 overflow-auto">

            <div className="border-b border-gray-700 p-3">

                <h2 className="font-semibold">

                    Console

                </h2>

            </div>

            <pre className="p-4 text-green-400 whitespace-pre-wrap">

                {output || "Program output will appear here..."}

            </pre>

        </div>

    );

}