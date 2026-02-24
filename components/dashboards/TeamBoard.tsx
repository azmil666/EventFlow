"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Search, Filter, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export default function TeamBoard({ eventId, userId }) {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (eventId) {
            fetchTeams();
        }
    }, [eventId]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teams?eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                // Filter out teams where current user is already a member
                const availableTeams = (data.teams || []).filter(team => 
                    team.leader?._id !== userId && 
                    !team.members?.some(m => m._id === userId)
                );
                setTeams(availableTeams);
            }
        } catch (error) {
            console.error("Error fetching teams for board:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p>Loading available teams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search teams by name, skills, or stack..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Stack
                    </button>
                </div>
            </div>

            {filteredTeams.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No teams found</h3>
                    <p className="mt-1">Be the first to start a team for this event!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => {
                        const memberCount = (team.members?.length || 0);
                        const isFull = memberCount >= (team.maxMembers || 4);

                        return (
                            <div key={team._id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{team.name}</h3>
                                            <span className="text-xs text-slate-500 mt-0.5">Led by {team.leader?.name}</span>
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm",
                                            isFull ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        )}>
                                            {memberCount}/{team.maxMembers || 4} Members
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 min-h-[60px]">
                                        {team.description || "No description provided yet. This team is looking for passionate builders to join their mission!"}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(team.tags || ["React", "AI", "Tailwind"]).map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-medium">Updated 2h ago</span>
                                    <button
                                        disabled={isFull}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                                            isFull 
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 shadow-lg"
                                        )}
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        {isFull ? "Full" : "Join Team"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
