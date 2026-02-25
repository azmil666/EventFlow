import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export interface Participant {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Team {
  _id: string;
  name: string;
  inviteCode: string;
  status: "active" | "disqualified" | "inactive" | string;
  leader: Participant;
  members: Participant[];
}

export interface ParticipantListProps {
  team: Team;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ParticipantListErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ParticipantList error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Error loading participants</h4>
            <p className="text-xs text-red-600 mt-1">
              We couldn&apos;t load the participant list for this team. Please try refreshing.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ParticipantListContent({ team }: ParticipantListProps) {
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
      {/* Leader */}
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700 font-bold shrink-0">
            {team.leader?.name?.charAt(0) || "?"}
          </div>
          <span
            className="text-sm font-medium text-slate-900 truncate max-w-[120px]"
            title={team.leader?.name}
          >
            {team.leader?.name || "Unknown"}
          </span>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
          Leader
        </span>
      </div>

      {/* Members */}
      {team.members?.map((member) => (
        <div key={member._id} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold shrink-0">
            {member.name ? member.name.charAt(0) : "?"}
          </div>
          <span
            className="text-sm text-slate-600 truncate max-w-[150px]"
            title={member.name}
          >
            {member.name || "Unknown"}
          </span>
        </div>
      ))}

      {(!team.members || team.members.length === 0) && (
        <p className="text-xs text-slate-400 italic pl-8">
          No other members joined yet.
        </p>
      )}
    </div>
  );
}

export default function ParticipantList({ team }: ParticipantListProps) {
  return (
    <ParticipantListErrorBoundary>
      <ParticipantListContent team={team} />
    </ParticipantListErrorBoundary>
  );
}
