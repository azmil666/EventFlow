"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface Announcement {
    _id: string;
    title: string;
    message: string;
    roleTarget: string;
    createdAt: string;
}

interface Props {
  user: User;
}

export default function ParticipantDashboardClient({ user }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
      try {
          const res = await fetch("/api/announcements");
          if (res.ok) {
              const data = await res.json();
              setAnnouncements(data);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Participant Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                <p className="text-gray-300 text-lg">Welcome back, <span className="text-indigo-400 font-semibold">{user?.name || "Participant"}</span>!</p>
                <p className="text-slate-400 mt-2">Ready to build something amazing today?</p>
              </div>

              {/* Placeholder for Events/Projects */}
              <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700/50">
                  <h2 className="text-xl font-bold mb-4">My Events</h2>
                  <div className="text-center py-8 text-gray-500">
                      <p>You haven't joined any events yet.</p>
                      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                          Browse Events
                      </button>
                  </div>
              </div>
          </div>

          {/* Sidebar / Announcements */}
          <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 overflow-hidden">
                  <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-indigo-400" />
                      <h2 className="font-bold text-lg">Announcements</h2>
                  </div>
                  
                  <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
                      {loading ? (
                          <p className="text-gray-500 text-center py-4">Loading updates...</p>
                      ) : announcements.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No new announcements.</p>
                      ) : (
                          announcements.map((ann) => (
                              <div key={ann._id} className="bg-slate-700/50 p-4 rounded border border-slate-600 hover:border-indigo-500/50 transition-colors">
                                  <h3 className="font-semibold text-indigo-300 mb-1">{ann.title}</h3>
                                  <p className="text-sm text-gray-300 mb-2">{ann.message}</p>
                                  <p className="text-xs text-gray-500 text-right">
                                      {new Date(ann.createdAt).toLocaleDateString()}
                                  </p>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
