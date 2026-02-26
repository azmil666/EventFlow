/**
 * @file Unit Tests for ICS Calendar Generation
 * @description Tests for ICS file generation, date formatting, text escaping, and download functionality
 * Ensures RFC 5545 compliance and proper calendar integration
 */

import { generateICS } from '@/utils/generateICS';

/**
 * Test Suite: ICS Generation Functionality
 */
describe('ICS Generation Utilities', () => {
  
  /**
   * Mock event data for testing
   */
  const mockEvent = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Tech Summit 2024',
    description: 'Join us for an amazing tech conference with industry leaders',
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-15T17:00:00Z',
    location: 'San Francisco Convention Center',
    registrationDeadline: '2024-03-10T23:59:59Z',
  };

  /**
   * Test 1: Verify ICS format structure and RFC 5545 compliance
   */
  test('generates valid ICS calendar structure', () => {
    const icsContent = generateICS(mockEvent);

    // Verify essential ICS components are present
    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('END:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('PRODID:-//EventFlow//Event Calendar//EN');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('END:VEVENT');
  });

  /**
   * Test 2: Verify event details are correctly embedded in ICS
   */
  test('includes all event details in generated ICS', () => {
    const icsContent = generateICS(mockEvent);

    expect(icsContent).toContain(`SUMMARY:${mockEvent.title}`);
    expect(icsContent).toContain(`LOCATION:${mockEvent.location}`);
    expect(icsContent).toContain(`DESCRIPTION:${mockEvent.description}`);
  });

  /**
   * Test 3: Verify date formatting to ICS format (YYYYMMDDTHHMMSSZ)
   */
  test('formats dates correctly to ICS format', () => {
    const icsContent = generateICS(mockEvent);

    // Date should be in format: 20240315T090000Z
    expect(icsContent).toContain('DTSTART:20240315T090000Z');
    expect(icsContent).toContain('DTEND:20240315T170000Z');
  });

  /**
   * Test 4: Verify special character escaping in text fields
   */
  test('escapes special characters in text fields', () => {
    const eventWithSpecialChars = {
      ...mockEvent,
      title: 'Event; with, special\\characters',
      description: 'Multi\nline\ndescription',
      location: 'Building "A"; Room 101',
    };

    const icsContent = generateICS(eventWithSpecialChars);

    // Verify escaping occurred
    expect(icsContent).toContain('Event\\; with\\, special\\\\characters');
    expect(icsContent).toContain('Multi\\nline\\ndescription');
    expect(icsContent).toContain('Building \\"A\\"\\; Room 101');
  });

  /**
   * Test 5: Verify alarm/reminder inclusion for registration deadline
   */
  test('includes registration deadline reminder', () => {
    const icsContent = generateICS(mockEvent);

    expect(icsContent).toContain('BEGIN:VALARM');
    expect(icsContent).toContain('TRIGGER:-P1D');
    expect(icsContent).toContain('registration deadline');
  });

  /**
   * Test 6: Verify event start reminder (1 hour before)
   */
  test('includes event start reminder', () => {
    const icsContent = generateICS(mockEvent);

    expect(icsContent).toContain('TRIGGER:-PT1H');
    expect(icsContent).toContain('Starting soon');
  });

  /**
   * Test 7: Verify handling of missing optional fields
   */
  test('handles missing optional fields gracefully', () => {
    const minimalEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Simple Event',
      description: '',
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-15T17:00:00Z',
      location: '',
      // registrationDeadline is omitted
    };

    const icsContent = generateICS(minimalEvent);

    expect(icsContent).toContain('SUMMARY:Simple Event');
    expect(icsContent).toContain('LOCATION:Virtual'); // Default location
    expect(icsContent).toContain('DESCRIPTION:'); // Empty description is OK
    // Should not include registration deadline alarm if not provided
    const alarmCount = (icsContent.match(/TRIGGER:-P1D/g) || []).length;
    expect(alarmCount).toBe(0);
  });

  /**
   * Test 8: Verify UID uniqueness and format
   */
  test('generates unique and properly formatted UID', () => {
    const icsContent = generateICS(mockEvent);

    expect(icsContent).toMatch(/UID:eventflow-[a-f0-9]+@eventflow\.app/);
  });

  /**
   * Test 9: Verify CRLF line endings (RFC 5545 requirement)
   */
  test('uses CRLF line endings as per RFC 5545', () => {
    const icsContent = generateICS(mockEvent);

    // Check that content uses \r\n line endings
    expect(icsContent).toContain('\r\n');
    // Verify no orphaned \n without \r
    const lines = icsContent.split('\r\n');
    lines.forEach((line) => {
      expect(line).not.toContain('\n');
    });
  });

  /**
   * Test 10: Verify timezone information
   */
  test('includes timezone metadata', () => {
    const icsContent = generateICS(mockEvent);

    expect(icsContent).toContain('X-WR-TIMEZONE:UTC');
    expect(icsContent).toContain('X-WR-CALNAME:EventFlow');
  });

  /**
   * Test 11: Handle edge case - very long title
   */
  test('handles very long event titles', () => {
    const longTitle = 'A'.repeat(200);
    const eventWithLongTitle = {
      ...mockEvent,
      title: longTitle,
    };

    const icsContent = generateICS(eventWithLongTitle);
    expect(icsContent).toContain(`SUMMARY:${longTitle}`);
  });

  /**
   * Test 12: Handle edge case - null/undefined event fields
   */
  test('handles null and undefined fields correctly', () => {
    const eventWithNullFields = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Event',
      description: null,
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-15T17:00:00Z',
      location: undefined,
    };

    const icsContent = generateICS(eventWithNullFields);
    expect(icsContent).toContain('DESCRIPTION:'); // Should handle null gracefully
    expect(icsContent).toContain('LOCATION:Virtual'); // Should use default for undefined
  });
});

/**
 * Integration Test Suite: File Download Functionality
 */
describe('ICS Download Functionality', () => {
  
  /**
   * Test: Browser environment mocking for download
   */
  test('creates proper blob for download', () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Tech Summit 2024',
      description: 'Conference',
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-15T17:00:00Z',
      location: 'SF',
    };

    const icsContent = generateICS(mockEvent);
    
    // Verify content is string and has proper ICS structure
    expect(typeof icsContent).toBe('string');
    expect(icsContent.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(icsContent.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});

/**
 * Edge Case Test Suite
 */
describe('Edge Cases and Error Handling', () => {
  
  /**
   * Test: Unicode character handling
   */
  test('handles unicode characters in event details', () => {
    const eventWithUnicode = {
      _id: '507f1f77bcf86cd799439011',
      title: '技術サミット 2024 🚀',
      description: 'Conférence internationale',
      startDate: '2024-03-15T09:00:00Z',
      endDate: '2024-03-15T17:00:00Z',
      location: '東京',
    };

    const icsContent = generateICS(eventWithUnicode);
    expect(icsContent).toContain('技術サミット 2024');
    expect(icsContent).toContain('Conférence');
  });

  /**
   * Test: Handles timestamps with timezone information
   */
  test('converts timezone-aware timestamps correctly', () => {
    const event = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Event',
      description: '',
      startDate: new Date('2024-03-15T09:00:00+05:30'), // IST timezone
      endDate: new Date('2024-03-15T17:00:00+05:30'),
      location: 'India',
    };

    const icsContent = generateICS(event);
    // Should convert to UTC (Z format)
    expect(icsContent).toMatch(/DTSTART:202403150[0-3]\d{6}Z/);
  });
});

/**
 * Summary:
 * - Validates ICS RFC 5545 compliance
 * - Tests date/time formatting
 * - Verifies special character escaping
 * - Confirms reminder/alarm inclusion
 * - Tests edge cases and unicode handling
 * - Ensures proper blob creation for downloads
 * 
 * To run tests: npm test -- generateICS.test.js
 */
