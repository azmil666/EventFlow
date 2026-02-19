"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  repoLink: string;
  demoLink?: string;
  team: {
    name: string;
    members: any[];
  };
  event: {
      _id: string;
      title: string;
  };
}

interface Props {
  user: User;
}

export default function JudgeDashboardClient({ user }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState({
    innovation: 0,
    execution: 0,
    presentation: 0,
    impact: 0,
  });
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const res = await fetch("/api/submissions");
      if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
             setSubmissions(data.submissions);
          } else {
             console.error("Unexpected response format:", data);
          }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setScores((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionId: selectedSubmission._id,
          scores,
          feedback,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Evaluation submitted successfully!" });
        setSelectedSubmission(null);
        setScores({ innovation: 0, execution: 0, presentation: 0, impact: 0 });
        setFeedback("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit evaluation" });
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading dashboard...</div>;
  }

  return (
    <div className="p-8 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Judge Dashboard</h1>
      <p className="mb-8 text-gray-300">Welcome, {user.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
          <h2 className="text-xl font-semibold mb-4">Submissions to Judge</h2>
          {submissions.length === 0 ? (
            <p className="text-gray-400">No submissions found.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`p-4 rounded cursor-pointer border transition-colors ${
                    selectedSubmission?._id === sub._id
                      ? "bg-indigo-900 border-indigo-500"
                      : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                  }`}
                >
                  <h3 className="font-medium text-lg">{sub.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 truncate">{sub.description}</p>
                   {sub.event && <p className="text-xs text-indigo-400 mt-2">{sub.event.title}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Form */}
        <div className="md:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
          {selectedSubmission ? (
            <div>
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold mb-2">{selectedSubmission.title}</h2>
                <p className="text-gray-300 mb-4">{selectedSubmission.description}</p>
                <div className="flex gap-4">
                  <a
                    href={selectedSubmission.repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    View Repository
                  </a>
                  {selectedSubmission.demoLink && (
                    <a
                      href={selectedSubmission.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      View Demo
                    </a>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitEvaluation}>
                <h3 className="text-xl font-semibold mb-4">Evaluation Score</h3>
                
                {message && (
                  <div
                    className={`p-3 mb-4 rounded ${
                      message.type === "success" ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {Object.keys(scores).map((criteria) => (
                    <div key={criteria}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {criteria} (0-10)
                      </label>
                      <input
                        type="number"
                        name={criteria}
                        min="0"
                        max="10"
                        value={scores[criteria as keyof typeof scores]}
                        onChange={handleScoreChange}
                        className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white h-32 focus:outline-none focus:border-indigo-500"
                    placeholder="Provide constructive feedback..."
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition-colors ${
                      submitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Evaluation"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="text-xl">Select a submission to evaluate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
