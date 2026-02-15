'use client';

import { useState, useEffect } from "react";

export default function MentorDashboard() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");

    useEffect(() => {
        // mock fetch simulation
        setTimeout(() => {
            setTeams([
                { id: 1, name: "Team Apollo" },
                { id: 2, name: "HyperLoopers" }
            ]);
            setLoading(false);
        }, 800);
    }, []);
const handleView = (team) => {
    setMessage(`Viewing ${team.name}`);
};

const handleReview = (team) => {
    setMessage(`Reviewing submissions for ${team.name}`);
};

const handleMessage = (team) => {
    setMessage(`Opening chat with ${team.name}`);
};


    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Mentor Dashboard</h1>
                <p className="text-slate-600">
                    Support your assigned teams and share your expertise.
                </p>
            </header>
{message && (
    <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
        {message}
    </div>
)}

            <div className="space-y-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-900 font-bold mb-4">Assigned Teams</h3>

                    {loading ? (
                        <p className="text-slate-500">Loading teams...</p>
                    ) : teams.length === 0 ? (
                        <p className="text-slate-500">No teams assigned yet.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {teams.map(team => (
                                <li key={team.id} className="py-3 flex justify-between items-center">
                                    <span>{team.name}</span>
                                   <div className="flex gap-4 text-sm">
    <button
        onClick={() => handleView(team)}
        className="text-blue-600 hover:underline"
    >
        View
    </button>

    <button
        onClick={() => handleReview(team)}
        className="text-green-600 hover:underline"
    >
        Review
    </button>

    <button
        onClick={() => handleMessage(team)}
        className="text-purple-600 hover:underline"
    >
        Message
    </button>
</div>


                                </li>
                            ))}
                        </ul>
                    )}

                </div>

            </div>
        </div>
    );
}
