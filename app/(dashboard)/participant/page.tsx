'use client';
import { Input, Label, FormField } from "@/components/ui/form";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Trophy,
  FileText,
  MessageSquare,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Bell,
  Target,
  Zap,
  ExternalLink,
  UserPlus,
  User
} from "lucide-react";

export default function ParticipantDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [team, setTeam] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [demoLink, setDemoLink] = useState("");

  // Fetch data when session is available
  useEffect(() => {
    if (status === "authenticated" && user?.id) {
      fetchUserData(user.id);
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, user?.id]);

  const fetchUserData = async (userId) => {
    try {
      // Fetch user profile
      const profileRes = await fetch("/api/auth/profile");

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        // Profile data available if needed
      }

      // Fetch user's team
      const teamRes = await fetch(`/api/teams?userId=${userId}`);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (teamData.teams && teamData.teams.length > 0) {
          setTeam(teamData.teams[0]);
        }
      }

      // Fetch available events
      const eventsRes = await fetch("/api/events");
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!newTeamName.trim()) {
      showNotification("Please enter a team name", "error");
      return;
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeamName,
          leaderId: user?.id,
          eventId: events[0]?._id // Use first event as default
        })
      });

      const data = await res.json();

      if (res.ok) {
        setTeam(data.team);
        setShowCreateModal(false);
        setNewTeamName("");
        showNotification("Team created successfully!", "success");
      } else {
        showNotification(data.error || "Failed to create team", "error");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      showNotification("Failed to create team", "error");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();

    if (!joinCode.trim()) {
      showNotification("Please enter an invite code", "error");
      return;
    }

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode: joinCode,
          userId: user?.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setTeam(data.team);
        setShowJoinModal(false);
        setJoinCode("");
        showNotification("Joined team successfully!", "success");
      } else {
        showNotification(data.error || "Failed to join team", "error");
      }
    } catch (error) {
      console.error("Error joining team:", error);
      showNotification("Failed to join team", "error");
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    if (!projectTitle || !projectDesc || !repoLink) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    if (!events.length) {
      showNotification("No active event found to submit to.", "error");
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: events[0]._id, // Defaulting to first event for now
          team: team._id,
          title: projectTitle,
          description: projectDesc,
          repoLink,
          demoLink
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSubmitModal(false);
        setProjectTitle("");
        setProjectDesc("");
        setRepoLink("");
        setDemoLink("");
        showNotification("Project submitted successfully!", "success");
      } else {
        showNotification(data.error || "Failed to submit project", "error");
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      showNotification("Failed to submit project", "error");
    }
  };

  const copyInviteCode = () => {
    if (team?.inviteCode) {
      navigator.clipboard.writeText(team.inviteCode);
      setInviteCodeCopied(true);
      showNotification("Invite code copied to clipboard!", "success");
      setTimeout(() => setInviteCodeCopied(false), 2000);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate days until deadline
  const getDaysUntil = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === "success"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          {notification.type === "success" ? <Check className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || "Participant"}!
              </h1>
              <p className="mt-2 text-blue-100 text-lg">
                Track your progress, manage your team, and crush your goals
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <p className="text-blue-200 text-sm">Active Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* No Team State */}
        {!team ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">You don&apos;t have a team yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Create a new team or join an existing one using an invite code to start participating in events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Team
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Join Team
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Team Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                    <p className="text-sm text-slate-500">{team.event?.title || "No event assigned"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Team Leader</p>
                    <p className="font-medium text-slate-900">{team.leader?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Members</p>
                    <p className="font-medium text-slate-900">{team.members?.length || 0} / 5</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Invite Code</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono bg-slate-100 px-3 py-1 rounded text-slate-900 font-medium">
                        {team.inviteCode}
                      </code>
                      <button
                        onClick={copyInviteCode}
                        className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                      >
                        {inviteCodeCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Team Members</h4>
                  <div className="flex flex-wrap gap-3">
                    {team.leader && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 text-sm font-medium">
                            {team.leader.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{team.leader.name}</p>
                          <p className="text-xs text-blue-600">Leader</p>
                        </div>
                      </div>
                    )}
                    {team.members?.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-slate-700 text-sm font-medium">
                            {member.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Days Active</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">7</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Submissions</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Rank</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">#12</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-500 text-sm font-medium">Score</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">85</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Available Events</h3>
                    <a href="/events" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {events.length === 0 ? (
                      <div className="p-8 text-center">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No events available</p>
                      </div>
                    ) : (
                      events.slice(0, 3).map((event) => (
                        <div key={event._id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">{event.title}</h4>
                              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(event.startDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {getDaysUntil(event.endDate)} days left
                                </span>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                              <ExternalLink className="w-5 h-5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-red-600 font-medium">FEB</span>
                        <span className="text-lg font-bold text-red-700">20</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Project Submission</p>
                        <p className="text-sm text-slate-500">Submit your final project</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 bg-amber-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-amber-600 font-medium">FEB</span>
                        <span className="text-lg font-bold text-amber-700">25</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Pitch Video</p>
                        <p className="text-sm text-slate-500">Upload 2-min pitch</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-blue-600 font-medium">MAR</span>
                        <span className="text-lg font-bold text-blue-700">01</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Final Presentation</p>
                        <p className="text-sm text-slate-500">Demo day presentation</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Submit Project</p>
                        <p className="text-sm text-slate-500">Upload your work</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Team Chat</p>
                        <p className="text-sm text-slate-500">Message your team</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-50 transition-colors group">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <Bell className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Notifications</p>
                        <p className="text-sm text-slate-500">View updates</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create a New Team</h3>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team Name
                </label>
                <FormField>
                  <Label>Field Name</Label>
                  <Input type="text" />
                </FormField>

              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Join a Team</h3>
            <form onSubmit={handleJoinTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Invite Code
                </label>
                <FormField>
                  <Label>Field Name</Label>
                  <Input type="text" />
                </FormField>

              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Project Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Project</h3>
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. AI Waste Sorter"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  required
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full rounded-md border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  GitHub Repository <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="url"
                  required
                  value={repoLink}
                  onChange={(e) => setRepoLink(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-slate-700 mb-1">
                  Demo Link (Optional)
                </Label>
                <Input
                  type="url"
                  value={demoLink}
                  onChange={(e) => setDemoLink(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
