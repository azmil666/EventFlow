/**
 * @file API Integration Tests for ICS Endpoint
 * @description Tests for /api/events/[id]/ics endpoint
 * Verifies proper ICS file generation, headers, and error handling
 */

import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/events/[id]/ics/route';
import dbConnect from '@/lib/db-connect';
import Event from '@/models/Event';

// Mock dependencies
jest.mock('@/lib/db-connect');
jest.mock('@/models/Event');

describe('/api/events/[id]/ics - ICS Download Endpoint', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: Successfully retrieve ICS file for valid event
   */
  test('returns ICS file for valid event ID', async () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Tech Summit 2024',
      description: 'Annual tech conference',
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'San Francisco',
      registrationDeadline: new Date('2024-03-10T23:59:59Z'),
    };

    // Mock database connection
    dbConnect.mockResolvedValueOnce(true);
    
    // Mock Event.findById to return our mock event
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockEvent),
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(req, { params: { id: '507f1f77bcf86cd799439011' } });

    // Verify response status
    expect(res._getStatusCode()).toBe(200);

    // Verify content type header
    expect(res._getHeaders()['content-type']).toContain('text/calendar');

    // Verify content-disposition header (for download)
    const contentDisposition = res._getHeaders()['content-disposition'];
    expect(contentDisposition).toContain('attachment');
    expect(contentDisposition).toContain('Tech%20Summit%202024.ics');

    // Verify response body is valid ICS
    const body = res._getData();
    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('END:VCALENDAR');
    expect(body).toContain('SUMMARY:Tech Summit 2024');
  });

  /**
   * Test 2: Return 404 for non-existent event
   */
  test('returns 404 for non-existent event', async () => {
    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    expect(res._getStatusCode()).toBe(404);
  });

  /**
   * Test 3: Return 400 for invalid event ID format
   */
  test('returns 400 for invalid event ID format', async () => {
    const { res } = createMocks({
      method: 'GET',
      query: { id: 'invalid-id' },
    });

    await GET(res, { params: { id: 'invalid-id' } });

    expect(res._getStatusCode()).toBe(400);
    const body = JSON.parse(res._getData());
    expect(body.error).toContain('Invalid event ID format');
  });

  /**
   * Test 4: Return 503 when database connection fails
   */
  test('returns 503 when database connection fails', async () => {
    dbConnect.mockResolvedValueOnce(false);

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    expect(res._getStatusCode()).toBe(503);
  });

  /**
   * Test 5: Verify proper caching headers
   */
  test('includes proper cache control headers', async () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Event',
      description: '',
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'Virtual',
    };

    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockEvent),
    });

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    const cacheControl = res._getHeaders()['cache-control'];
    expect(cacheControl).toContain('public');
    expect(cacheControl).toContain('max-age=3600');
  });

  /**
   * Test 6: Handle database errors gracefully
   */
  test('returns 500 on database error', async () => {
    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockRejectedValueOnce(new Error('Database error')),
    });

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    expect(res._getStatusCode()).toBe(500);
    const body = JSON.parse(res._getData());
    expect(body.error).toContain('Failed to generate calendar file');
  });

  /**
   * Test 7: Correctly encodes special characters in filename
   */
  test('properly encodes event title in filename', async () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Tech Summit 2024 - Q1/Q2',
      description: '',
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'Virtual',
    };

    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockEvent),
    });

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    const contentDisposition = res._getHeaders()['content-disposition'];
    expect(contentDisposition).toContain('filename=');
    // Verify special characters are handled
    expect(contentDisposition).not.toContain('undefined');
  });

  /**
   * Test 8: Return only necessary fields from database
   */
  test('fetches only required fields from database', async () => {
    const mockEventModel = {
      select: jest.fn().mockResolvedValueOnce({
        _id: '507f1f77bcf86cd799439011',
        title: 'Event',
        description: '',
        startDate: new Date('2024-03-15T09:00:00Z'),
        endDate: new Date('2024-03-15T17:00:00Z'),
        location: 'Virtual',
      }),
    };

    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue(mockEventModel);

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    // Verify only necessary fields are selected
    expect(mockEventModel.select).toHaveBeenCalledWith(
      '_id title description startDate endDate location registrationDeadline'
    );
  });
});

/**
 * Performance Test Suite
 */
describe('ICS Endpoint Performance', () => {
  
  /**
   * Test: Response time for large description
   */
  test('handles events with large descriptions efficiently', async () => {
    const largeDescription = 'A'.repeat(5000); // 5KB description
    const mockEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Event',
      description: largeDescription,
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-15T17:00:00Z'),
      location: 'Virtual',
    };

    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(mockEvent),
    });

    const startTime = Date.now();
    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Response should be generated in less than 100ms
    expect(responseTime).toBeLessThan(100);
    expect(res._getStatusCode()).toBe(200);
  });
});

/**
 * Integration Test: End-to-end ICS download flow
 */
describe('End-to-End ICS Download Flow', () => {
  
  /**
   * Test: Complete download cycle with all event details
   */
  test('completes full ICS download cycle with all details', async () => {
    const completeEvent = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Annual Hackathon 2024',
      description: `Join us for the biggest tech competition of the year!
      
Tracks:
- Web Development
- Mobile App
- AI/ML
- Blockchain

Rules:
1. Teams of 2-4 members
2. 24-hour coding marathon
3. Open to all experience levels`,
      startDate: new Date('2024-06-15T08:00:00Z'),
      endDate: new Date('2024-06-16T08:00:00Z'),
      location: 'San Francisco Convention Center, Hall A',
      registrationDeadline: new Date('2024-06-10T23:59:59Z'),
    };

    dbConnect.mockResolvedValueOnce(true);
    Event.findById.mockReturnValue({
      select: jest.fn().mockResolvedValueOnce(completeEvent),
    });

    const { res } = createMocks({
      method: 'GET',
      query: { id: '507f1f77bcf86cd799439011' },
    });

    await GET(res, { params: { id: '507f1f77bcf86cd799439011' } });

    expect(res._getStatusCode()).toBe(200);
    const icsContent = res._getData();
    
    // Verify complete ICS structure
    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('SUMMARY:Annual Hackathon 2024');
    expect(icsContent).toContain('BEGIN:VALARM'); // Should have reminders
    
    // Verify all alarms are included
    const alarmMatches = icsContent.match(/BEGIN:VALARM/g);
    expect(alarmMatches.length).toBeGreaterThanOrEqual(2); // At least event and deadline alarms
  });
});
