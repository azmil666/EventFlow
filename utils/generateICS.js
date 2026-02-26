/**
 * Formats a JavaScript Date to ICS datetime format (YYYYMMDDTHHMMSSZ)
 * Complies with RFC 5545 iCalendar specification
 * @private
 */
const formatICSDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Escapes special characters in text fields for ICS format compliance
 * Prevents breaking ICS field parsing
 * @private
 */
const escapeICSText = (text) => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\') // Backslash
    .replace(/;/g, '\\;') // Semicolon
    .replace(/,/g, '\\,') // Comma
    .replace(/\n/g, '\\n') // Newline
    .replace(/\r/g, '\\r'); // Carriage return
};

/**
 * Generates a unique event identifier for iCalendar format
 * @private
 */
const generateUID = (eventId = '') => {
  const randomId = Math.random().toString(36).substring(2).slice(0, 10);
  return `eventflow-${eventId || randomId}@eventflow.app`;
};

/**
 * Generate ICS (iCalendar) file content for an event
 * Creates RFC 5545 compliant calendar file content
 * 
 * @param {Object} event - Event data object
 * @param {string} event.title - Event title
 * @param {string} event.description - Event description
 * @param {string|Date} event.startDate - Event start date (ISO string or Date object)
 * @param {string|Date} event.endDate - Event end date (ISO string or Date object)
 * @param {string} [event.location] - Event location (defaults to "Virtual")
 * @param {string|Date} [event.registrationDeadline] - Registration deadline (optional)
 * @param {string} [event._id] - MongoDB event ID for unique identifier generation
 * @returns {string} Complete ICS file content ready for download or import
 */
export function generateICS(event) {
  const { 
    _id,
    title, 
    description, 
    startDate, 
    endDate, 
    location, 
    registrationDeadline 
  } = event;

  // Build ICS calendar header with required meta-information
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventFlow//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:EventFlow',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:${generateUID(_id)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description || '')}`,
    `LOCATION:${escapeICSText(location || 'Virtual')}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
  ];

  // Add registration deadline reminder (1 day before) if provided
  if (registrationDeadline) {
    icsContent.push(
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: Registration deadline for ${escapeICSText(title)}`,
      'END:VALARM'
    );
  }

  // Add event start reminder (1 hour before)
  icsContent.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Starting soon: ${escapeICSText(title)}`,
    'END:VALARM'
  );

  icsContent.push('END:VEVENT', 'END:VCALENDAR');

  return icsContent.join('\r\n');
}

/**
 * Triggers download of ICS file with client-side generation
 * Uses Blob API to create and download file without server request
 * 
 * @param {Object} event - Event data object containing all necessary fields
 * @param {string} [filename] - Optional custom filename (without .ics extension)
 * @throws {Error} If blob creation or download fails
 * @returns {Promise<void>}
 */
export async function downloadICS(event, filename) {
  try {
    // Validate required event data
    if (!event || !event.title) {
      throw new Error('Event title is required for ICS generation');
    }

    // Generate ICS content
    const icsContent = generateICS(event);
    
    // Create Blob with proper MIME type for calendar files
    const blob = new Blob([icsContent], { 
      type: 'text/calendar;charset=utf-8' 
    });

    // Create temporary URL for blob
    const url = URL.createObjectURL(blob);

    // Create and trigger download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || event.title || 'event'}.ics`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up temporary URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error('Failed to download ICS file:', error);
    throw new Error(`ICS download failed: ${error.message}`);
  }
}

/**
 * Downloads ICS file from server API endpoint
 * Useful for large events or server-side processing requirements
 * 
 * @param {string} eventId - MongoDB event ID
 * @param {string} [eventTitle] - Optional event title for filename fallback
 * @throws {Error} If API request fails
 * @returns {Promise<void>}
 */
export async function downloadICSFromAPI(eventId, eventTitle) {
  try {
    // Validate event ID format
    if (!eventId || eventId.length !== 24) {
      throw new Error('Invalid event ID format');
    }

    // Request ICS file from API endpoint
    const response = await fetch(`/api/events/${eventId}/ics`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    // Extract filename from Content-Disposition header or use fallback
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `${eventTitle || 'event'}.ics`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=([^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '').replace(/%20/g, ' ');
      }
    }

    // Convert response to blob and trigger download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up temporary URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error('Failed to download ICS from API:', error);
    throw new Error(`API ICS download failed: ${error.message}`);
  }
}

/**
 * Opens event in Google Calendar with pre-filled details
 * Creates a calendar.google.com link with event information
 * 
 * @param {Object} event - Event data object
 * @returns {void}
 */
export function openInGoogleCalendar(event) {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
    } = event;

    if (!title || !startDate || !endDate) {
      throw new Error('Title, start date, and end date are required');
    }

    // Format dates for Google Calendar URL (YYYYMMDDTHHMMSSZ)
    const formatGCalDate = (date) => {
      const d = new Date(date);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Build Google Calendar intent URL
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description || '',
      location: location || 'Virtual',
      dates: `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`,
    });

    const url = `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
    window.open(url, '_blank');

  } catch (error) {
    console.error('Failed to open Google Calendar:', error);
    alert('Could not open Google Calendar. Please try downloading the ICS file instead.');
  }
}
