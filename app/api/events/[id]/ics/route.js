/**
 * @file ICS (iCalendar) File Generation API Endpoint
 * @description Generates and serves ICS calendar files for events
 * Allows users to download and import events into their calendar applications
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Event from "@/models/Event";

/**
 * Formats a JavaScript Date object to ICS datetime format (YYYYMMDDTHHMMSSZ)
 * @param {Date | string} date - Date object or ISO string
 * @returns {string} Formatted date string in ICS format with UTC timezone indicator
 */
const formatICSDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  // Convert to ISO string, remove special characters, append Z for UTC
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

/**
 * Escapes special characters in ICS text fields to comply with RFC 5545
 * @param {string} text - Plain text to escape
 * @returns {string} Escaped text safe for ICS format
 */
const escapeICSText = (text) => {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\") // Backslash
    .replace(/;/g, "\\;") // Semicolon
    .replace(/,/g, "\\,") // Comma
    .replace(/\n/g, "\\n") // Newline
    .replace(/\r/g, "\\r"); // Carriage return
};

/**
 * Generates a unique event identifier for the ICS file
 * @param {string} eventId - MongoDB event ID
 * @returns {string} Unique identifier in format suitable for VCALENDAR UID
 */
const generateUID = (eventId) => {
  return `eventflow-${eventId}@eventflow.app`;
};

/**
 * Constructs ICS calendar content from event data
 * @param {Object} event - Event document from MongoDB
 * @returns {string} Complete ICS file content
 */
const generateICSContent = (event) => {
  const {
    _id,
    title,
    description,
    startDate,
    endDate,
    location,
    registrationDeadline,
  } = event;

  // Build ICS header with calendar meta information
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EventFlow//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:EventFlow Calendar",
    "X-WR-TIMEZONE:UTC",
  ];

  // Begin main event definition
  icsLines.push(
    "BEGIN:VEVENT",
    `UID:${generateUID(_id)}`,
    `DTSTAMP:${formatICSDate(new Date())}`, // Event creation timestamp
    `DTSTART:${formatICSDate(startDate)}`, // Event start
    `DTEND:${formatICSDate(endDate)}`, // Event end
    `SUMMARY:${escapeICSText(title)}`, // Event title
    `DESCRIPTION:${escapeICSText(description || "")}`, // Event description
    `LOCATION:${escapeICSText(location || "Virtual")}`, // Event location
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H", // Alarm 1 hour before event
    "ACTION:DISPLAY",
    `DESCRIPTION:EventFlow Reminder: ${escapeICSText(title)} starts in 1 hour`,
    "END:VALARM"
  );

  // Add registration deadline reminder if available
  if (registrationDeadline) {
    icsLines.push(
      "BEGIN:VALARM",
      "TRIGGER:-P1D", // Alarm 1 day before registration deadline
      "ACTION:DISPLAY",
      `DESCRIPTION:EventFlow: Registration deadline for ${escapeICSText(title)} is tomorrow`,
      "END:VALARM"
    );
  }

  // Close event and calendar
  icsLines.push("END:VEVENT", "END:VCALENDAR");

  return icsLines.join("\r\n");
};

/**
 * GET /api/events/[id]/ics
 * Serves an ICS (iCalendar) file for a specific event
 * @param {Request} request - Next.js request object
 * @param {Object} params - Route parameters including event ID
 * @returns {Response} ICS file as text/calendar or error response
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectID format to prevent CastError
    if (!id || id === "0" || id.length !== 24) {
      return NextResponse.json(
        { error: "Invalid event ID format" },
        { status: 400 }
      );
    }

    // Establish database connection
    const connected = await dbConnect();
    if (!connected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    // Fetch event from database with minimal fields needed for ICS
    const event = await Event.findById(id).select(
      "_id title description startDate endDate location registrationDeadline"
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generate ICS content
    const icsContent = generateICSContent(event);

    // Create response with appropriate headers for ICS file download/import
    const response = new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar;charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          event.title
        )}.ics"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

    return response;
  } catch (error) {
    console.error("Error generating ICS file:", error);
    return NextResponse.json(
      {
        error: "Failed to generate calendar file",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
