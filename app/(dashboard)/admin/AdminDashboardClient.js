"use client";

import React, { useState, useEffect } from "react";

export default function AdminDashboardClient({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Events State
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft",
    modules: {
      judging: true,
      certificates: true,
      gallery: true,
      teams: true,
    },
  });

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: "",
    message: "",
    roleTarget: "all",
    expiresAt: "",
  });

  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "announcements") {
      fetchAnnouncements();
    }
  }, [activeTab]);

  // --- Events Logic ---
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || data); 
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleToggle = (moduleName) => {
    setEventFormData((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleName]: !prev.modules[moduleName],
      },
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEvent
        ? `/api/events/${editingEvent._id}`
        : "/api/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventFormData),
      });

      if (res.ok) {
        setShowEventForm(false);
        setEditingEvent(null);
        fetchEvents();
        setEventFormData({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            status: "draft",
            modules: {
              judging: true,
              certificates: true,
              gallery: true,
              teams: true,
            },
          });
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to save event"}`);
      }
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
      status: event.status,
      modules: event.modules || {
        judging: true,
        certificates: true,
        gallery: true,
        teams: true,
      },
    });
    setShowEventForm(true);
  };

  // --- Announcements Logic ---
  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(announcementFormData),
      });

      if (res.ok) {
        setShowAnnouncementForm(false);
        fetchAnnouncements();
        setAnnouncementFormData({
            title: "",
            message: "",
            roleTarget: "all",
            expiresAt: "",
        });
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to create announcement"}`);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
      if (!confirm("Are you sure you want to deactivate this announcement?")) return;
      try {
          const res = await fetch("/api/announcements", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id })
          });
          if (res.ok) fetchAnnouncements();
      } catch (err) {
          console.error(err);
      }
  };


  return (
    <div className="p-8 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6 gap-6">
        {["overview", "events", "announcements"].map((tab) => (
            <button
            key={tab}
            className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab(tab)}
            >
            {tab}
            </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <p className="text-gray-300">Welcome back, {user?.name || "Admin"}!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-indigo-900/30 p-6 rounded-lg border border-indigo-500/30">
                  <h3 className="text-lg font-semibold mb-2">Events</h3>
                  <p className="text-3xl font-bold">{events.length > 0 ? events.length : "-"}</p>
              </div>
              <div className="bg-purple-900/30 p-6 rounded-lg border border-purple-500/30">
                  <h3 className="text-lg font-semibold mb-2">Announcements</h3>
                  <p className="text-3xl font-bold">{announcements.length > 0 ? announcements.length : "-"}</p>
              </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Events</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    status: "draft",
                    modules: {
                      judging: true,
                      certificates: true,
                      gallery: true,
                      teams: true,
                    },
                  });
                setShowEventForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
            >
              Create Event
            </button>
          </div>

          {showEventForm && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-bold mb-4">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h3>
              <form onSubmit={handleEventSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={eventFormData.title}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={eventFormData.status}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                    >
                        <option value="draft">Draft</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventFormData.startDate}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={eventFormData.endDate}
                      onChange={handleEventInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={eventFormData.description}
                    onChange={handleEventInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white h-24"
                    required
                  ></textarea>
                </div>

                {/* Module Toggles */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3 border-b border-slate-700 pb-2">
                    Event Modules
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(eventFormData.modules).map((module) => (
                      <div key={module} className="flex items-center space-x-2">
                         <input
                            type="checkbox"
                            id={`module-${module}`}
                            checked={eventFormData.modules[module]}
                            onChange={() => handleModuleToggle(module)}
                            className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
                         />
                         <label htmlFor={`module-${module}`} className="text-sm font-medium capitalize select-none cursor-pointer">
                            {module}
                         </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingEvents ? (
            <p>Loading events...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-400">Title</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-400">Date</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                        No events found.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event._id} className="hover:bg-slate-700/50">
                        <td className="py-3 px-4">{event.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.status === 'ongoing' ? 'bg-green-900 text-green-200' :
                            event.status === 'upcoming' ? 'bg-blue-900 text-blue-200' :
                            event.status === 'completed' ? 'bg-gray-700 text-gray-300' :
                            'bg-yellow-900 text-yellow-200'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(event.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Announcements</h2>
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors"
            >
              New Announcement
            </button>
          </div>

          {showAnnouncementForm && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-bold mb-4">Create Announcement</h3>
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={announcementFormData.title}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                    <select
                      name="roleTarget"
                      value={announcementFormData.roleTarget}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                    >
                        <option value="all">All Users</option>
                        <option value="participants">Participants</option>
                        <option value="judges">Judges</option>
                        <option value="mentors">Mentors</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expires At (Optional)</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={announcementFormData.expiresAt}
                      onChange={handleAnnouncementInputChange}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    name="message"
                    value={announcementFormData.message}
                    onChange={handleAnnouncementInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white h-24"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementForm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  >
                    Post Announcement
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingAnnouncements ? (
            <p>Loading announcements...</p>
          ) : (
            <div className="space-y-4">
               {announcements.length === 0 ? (
                   <p className="text-gray-400">No active announcements.</p>
               ) : (
                   announcements.map((ann) => (
                       <div key={ann._id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
                           <div>
                               <h3 className="font-bold text-lg">{ann.title}</h3>
                               <p className="text-slate-300 mt-1">{ann.message}</p>
                               <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                   <span>Target: {ann.roleTarget}</span>
                                   <span>Posted: {new Date(ann.createdAt).toLocaleDateString()}</span>
                               </div>
                           </div>
                           <button
                               onClick={() => handleDeleteAnnouncement(ann._id)}
                               className="text-red-400 hover:text-red-300 text-sm"
                           >
                               Deactivate
                           </button>
                       </div>
                   ))
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
