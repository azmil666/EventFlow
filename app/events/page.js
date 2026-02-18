import Link from "next/link";
import { Calendar, Users, Trophy, ArrowRight, Star, MapPin } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Aurora from "@/components/common/Aurora";

const events = [
    {
        id: "1",
        title: "Global AI Hackathon",
        date: "Feb 15, 2026",
        location: "Virtual",
        participants: "500+",
        status: "Upcoming",
        description: "Build the future of AI with cutting-edge challenges",
    },
    {
        id: "2",
        title: "Web3 Builders Summit",
        date: "Mar 10, 2026",
        location: "San Francisco, CA",
        participants: "200+",
        status: "Registration Open",
        description: "Shape the decentralized future of the internet",
    },
    {
        id: "3",
        title: "Green Tech Challenge",
        date: "Apr 5, 2026",
        location: "London, UK",
        participants: "350+",
        status: "Coming Soon",
        description: "Innovate sustainable solutions for a better planet",
    },

];

export default function EventsPage() {
    return (
        <main className="min-h-screen bg-space-900 relative">
            {/* Navigation */}
            <Navbar />

            {/* Aurora Background - Full screen behind hero */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Aurora
                    colorStops={["#00ff87", "#60a5fa", "#00ff87"]}
                    amplitude={1.2}
                    blend={0.6}
                    speed={0.8}
                />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full text-neon-cyan text-sm font-medium mb-8 backdrop-blur-sm">
                        <Star className="w-4 h-4" />
                        Discover Amazing Events
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white mb-6 leading-[1.1] tracking-tight font-serif italic">
                        Browse <span className="font-serif italic text-neon-cyan">Upcoming</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-white/80">
                            Tech Events
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed font-mono">
                        Join hackathons, competitions, and tech events from around the world.
                        Find your next challenge and connect with innovative minds.
                    </p>
                </div>
            </section>

            {/* Events Grid Section */}
            <section className="relative z-10 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event, index) => (
                            <div
                                key={event.id}
                                className="glass-card border-glow p-8 rounded-2xl transition-all duration-400 group hover:scale-[1.02] cursor-pointer"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${event.status === "Registration Open"
                                            ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                                            : event.status === "Upcoming"
                                                ? "bg-neon-violet/20 text-neon-violet border border-neon-violet/30"
                                                : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                                        }`}>
                                        {event.status}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        {event.participants} Participants
                                    </span>
                                </div>

                                {/* Event Title */}
                                <h3 className="text-xl font-semibold text-white mb-3 tracking-wide group-hover:text-neon-cyan transition-colors">
                                    {event.title}
                                </h3>

                                {/* Description */}
                                <p className="text-slate-400 leading-relaxed text-sm font-mono mb-6">
                                    {event.description}
                                </p>

                                {/* Event Details */}
                                <div className="flex items-center gap-4 mb-6 text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-mono">{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-mono">{event.location}</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Link
                                    href={`/events/${event.id}`}
                                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group-hover:border-neon-cyan/30"
                                >
                                    View Event
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card rounded-3xl p-10 sm:p-12 border-glow">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                            Want to Organize Your Own Event?
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 font-mono">
                            Create your hackathon or tech event with EventFlow&apos;s powerful platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 tracking-wide text-sm"
                            >
                                Start Organizing
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">
                                EventFlow
                            </span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link
                                href="/events"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                Events
                            </Link>
                            <Link
                                href="https://github.com/R3ACTR/EventFlow"
                                target="_blank"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                GitHub
                            </Link>
                            <Link
                                href="/login"
                                className="text-slate-500 hover:text-neon-cyan transition text-sm uppercase tracking-wider"
                            >
                                Login
                            </Link>
                        </div>
                        <div className="text-slate-600 text-sm">
                            Built with love for the open-source community
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
