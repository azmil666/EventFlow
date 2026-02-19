import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";
import Team from "@/models/Team";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import { auth } from "@/auth";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  registrationDeadline: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  rules: z.array(z.string()).optional(),
  tracks: z.array(z.string()).optional(),
  status: z.enum(["draft", "upcoming", "ongoing", "completed", "ended"]).optional(),
  modules: z.object({
    judging: z.boolean().optional(),
    certificates: z.boolean().optional(),
    gallery: z.boolean().optional(),
    teams: z.boolean().optional(),
  }).optional(),
});

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const event = await Event.findById(id).populate('organizer', 'name email');
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const session = await auth();
    const { id } = await params;

    if (!session || (session.user.role !== "admin" && session.user.role !== "organizer")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const event = await Event.findById(id);
    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (session.user.role !== "admin" && event.organizer.toString() !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const oldStatus = event.status;
    const newStatus = validation.data.status;
    
    // Update event
    // Manually update fields to avoid overwriting with undefined if not present in validation
    if (validation.data.title) event.title = validation.data.title;
    if (validation.data.description) event.description = validation.data.description;
    if (validation.data.startDate) event.startDate = validation.data.startDate;
    if (validation.data.endDate) event.endDate = validation.data.endDate;
    if (validation.data.registrationDeadline !== undefined) event.registrationDeadline = validation.data.registrationDeadline;
    if (validation.data.rules) event.rules = validation.data.rules;
    if (validation.data.tracks) event.tracks = validation.data.tracks;
    if (validation.data.status) event.status = validation.data.status;
    if (validation.data.modules) event.modules = { ...event.modules, ...validation.data.modules };

    const updatedEvent = await event.save();

    // Certificate Generation Logic
    if (oldStatus !== "completed" && newStatus === "completed" && updatedEvent.modules?.certificates) {
        console.log("Event completed, generating certificates...");
        
        // Find all teams
        // Populate 'leader' and 'members' which are references to User
        const teams = await Team.find({ event: id })
            .populate('leader', 'name email')
            .populate('members', 'name email');
        
        const certificatesToCreate = [];
        
        for (const team of teams) {
            // Leader
            if (team.leader) {
                certificatesToCreate.push({
                    event: id,
                    recipientName: team.leader.name,
                    recipientEmail: team.leader.email,
                    role: "participant", 
                    certificateId: `CERT-${id}-${team.leader._id}-${Date.now()}`
                });
            }
            
            // Members
            if (team.members && Array.isArray(team.members)) {
                for (const member of team.members) {
                     if (member) { // Ensure member exists (was populated)
                        certificatesToCreate.push({
                            event: id,
                            recipientName: member.name,
                            recipientEmail: member.email,
                            role: "participant",
                            certificateId: `CERT-${id}-${member._id}-${Date.now()}`
                        });
                     }
                }
            }
        }
        
        // Batch create certificates
        if (certificatesToCreate.length > 0) {
            try {
                // Use insertMany (ordered: false to ignore duplicates if any)
                // Note: certificateId is unique, so duplicates might fail, ordered: false continues
                await Certificate.insertMany(certificatesToCreate, { ordered: false });
                console.log(`Generated ${certificatesToCreate.length} certificates.`);
            } catch (err) {
                console.error("Error generating certificates (some might be duplicates):", err);
            }
        }
    }

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const session = await auth();
        const { id } = await params;
    
        if (!session || (session.user.role !== "admin")) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        
        if (session.user.role !== "admin" && event.organizer.toString() !== session.user.id) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    
        await Event.findByIdAndDelete(id);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
