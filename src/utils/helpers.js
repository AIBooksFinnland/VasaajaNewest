/**
 * Collection of helper functions for the Vasa Merkintä app
 */

/**
 * Format a date string to Finnish locale
 * @param {string|Date} dateString - ISO date string or Date object
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime ? {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      } : {}),
    };

    return date.toLocaleDateString('fi-FI', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Calculate the distance between two geo coordinates in meters
 * Uses the Haversine formula
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} - Distance in meters
 */
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) {
    return null;
  }

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in meters
};

/**
 * Generate a unique identifier for a reindeer entry
 * Combines the vasa number, emo number, and timestamp
 * @param {string} vasaNumber - The calf identifier
 * @param {string} emoNumber - The mother identifier
 * @returns {string} - A unique hash string
 */
export const generateEntryIdentifier = (vasaNumber, emoNumber) => {
  const timestamp = new Date().getTime();
  const combined = `${vasaNumber}-${emoNumber}-${timestamp}`;

  // Simple hash function without bitwise operations
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash * 31) + char) % 1000000;
  }

  return Math.abs(hash).toString(16);
};

/**
 * Check if a device is in proximity based on distance
 * @param {Object} location1 - {latitude, longitude}
 * @param {Object} location2 - {latitude, longitude}
 * @param {number} thresholdMeters - Maximum distance in meters to be considered in proximity
 * @returns {boolean} - Whether the locations are in proximity
 */
export const isInProximity = (location1, location2, thresholdMeters = 100) => {
  if (!location1 || !location2) {
    return false;
  }

  const distance = calculateDistance(location1, location2);
  return distance !== null && distance <= thresholdMeters;
};

/**
 * Compare two arrays for equality (order matters)
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} - Whether the arrays are equal
 */
export const arraysEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * Deep compare two objects for equality
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} - Whether the objects are equal
 */
export const objectsEqual = (obj1, obj2) => {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!objectsEqual(obj1[key], obj2[key])) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Group entries by a key field
 * @param {Array} entries - Array of entry objects
 * @param {string} keyField - Field to group by
 * @returns {Object} - Grouped entries
 */
export const groupEntriesByField = (entries, keyField) => {
  if (!Array.isArray(entries) || !keyField) {
    return {};
  }

  return entries.reduce((grouped, entry) => {
    const key = entry[keyField];
    if (!key) {
      return grouped;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);

    return grouped;
  }, {});
};

/**
 * Count sync status of entries
 * @param {Array} entries - Array of entry objects
 * @returns {Object} - Counts of synced and unsynced entries
 */
export const countSyncStatus = (entries) => {
  if (!Array.isArray(entries)) {
    return { synced: 0, unsynced: 0, total: 0 };
  }

  const synced = entries.filter(entry => entry.synced).length;
  const unsynced = entries.length - synced;

  return {
    synced,
    unsynced,
    total: entries.length,
  };
};

/**
 * Filter entries by multiple criteria
 * @param {Array} entries - Array of entry objects
 * @param {Object} filters - Filter criteria {field: value}
 * @returns {Array} - Filtered entries
 */
export const filterEntries = (entries, filters = {}) => {
  if (!Array.isArray(entries) || !filters || Object.keys(filters).length === 0) {
    return entries;
  }

  return entries.filter(entry => {
    for (const [field, value] of Object.entries(filters)) {
      // Skip empty filter values
      if (value === null || value === undefined || value === '') {
        continue;
      }

      // If the field doesn't exist in the entry, it doesn't match
      if (!(field in entry)) {
        return false;
      }

      // For string fields, do case-insensitive includes
      if (typeof entry[field] === 'string' && typeof value === 'string') {
        if (!entry[field].toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      }
      // For boolean fields, exact match
      else if (typeof entry[field] === 'boolean') {
        if (entry[field] !== value) {
          return false;
        }
      }
      // For date fields, handle special date comparison
      else if (field.includes('Date') && entry[field] && value.start && value.end) {
        const date = new Date(entry[field]);
        const start = new Date(value.start);
        const end = new Date(value.end);
        if (date < start || date > end) {
          return false;
        }
      }
      // For number fields, handle min/max ranges
      else if (typeof entry[field] === 'number' && typeof value === 'object') {
        if (
          (value.min !== undefined && entry[field] < value.min) ||
          (value.max !== undefined && entry[field] > value.max)
        ) {
          return false;
        }
      }
      // For everything else, exact match
      else if (entry[field] !== value) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Validate a vasa entry object
 * @param {Object} entry - Entry object to validate
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateEntry = (entry) => {
  const errors = [];

  if (!entry) {
    return { isValid: false, errors: ['Entry is required'] };
  }

  // Required fields
  if (!entry.vasaNumber) {
    errors.push('Vasan numero on pakollinen');
  } else if (entry.vasaNumber.length > 20) {
    errors.push('Vasan numero on liian pitkä (max 20 merkkiä)');
  }

  if (!entry.emoNumber) {
    errors.push('Emon numero on pakollinen');
  } else if (entry.emoNumber.length > 20) {
    errors.push('Emon numero on liian pitkä (max 20 merkkiä)');
  }

  if (!entry.groupId) {
    errors.push('Ryhmän ID on pakollinen');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format error messages for user display
 * @param {string|Array} error - Error message or array of errors
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) {
    return '';
  }

  if (Array.isArray(error)) {
    return error.join('\n');
  }

  if (typeof error === 'object') {
    return error.message || JSON.stringify(error);
  }

  return String(error);
};
