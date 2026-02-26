/**
 * Bookmark utility for managing event bookmarks in localStorage
 */

const BOOKMARKS_KEY = 'eventflow_bookmarks';

/**
 * Get all bookmarked event IDs from localStorage
 * @returns {string[]} Array of bookmarked event IDs
 */
export function getBookmarks() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
}

/**
 * Check if an event is bookmarked
 * @param {string} eventId - The event ID to check
 * @returns {boolean} True if the event is bookmarked
 */
export function isBookmarked(eventId) {
  const bookmarks = getBookmarks();
  return bookmarks.includes(eventId);
}

/**
 * Add an event to bookmarks
 * @param {string} eventId - The event ID to bookmark
 * @returns {string[]} Updated array of bookmarked event IDs
 */
export function addBookmark(eventId) {
  if (typeof window === 'undefined') return [];
  
  try {
    const bookmarks = getBookmarks();
    if (!bookmarks.includes(eventId)) {
      const updatedBookmarks = [...bookmarks, eventId];
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      return updatedBookmarks;
    }
    return bookmarks;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return [];
  }
}

/**
 * Remove an event from bookmarks
 * @param {string} eventId - The event ID to remove from bookmarks
 * @returns {string[]} Updated array of bookmarked event IDs
 */
export function removeBookmark(eventId) {
  if (typeof window === 'undefined') return [];
  
  try {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(id => id !== eventId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    return updatedBookmarks;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return [];
  }
}

/**
 * Toggle bookmark status for an event
 * @param {string} eventId - The event ID to toggle
 * @returns {boolean} New bookmark status (true if bookmarked, false if removed)
 */
export function toggleBookmark(eventId) {
  if (isBookmarked(eventId)) {
    removeBookmark(eventId);
    return false;
  } else {
    addBookmark(eventId);
    return true;
  }
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
  }
}
