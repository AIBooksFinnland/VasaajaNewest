import uuid from 'react-native-uuid';
import { validateEntry } from '../utils/validation';

/**
 * Model class for vasanmerkintä (reindeer calf marking) entries
 */
class Entry {
  /**
   * Create a new Entry instance
   * @param {Object} data - Entry data
   * @param {string} data.vasaNumber - Reindeer calf identifier
   * @param {string} data.emoNumber - Mother reindeer identifier
   * @param {string} data.groupId - ID of the group this entry belongs to
   * @param {string} data.createdBy - ID of the user who created the entry
   * @param {string} data.creatorName - Username of the creator
   * @param {string} data.id - Unique ID (generated if not provided)
   * @param {string} data.createdAt - Creation timestamp (current time if not provided)
   * @param {boolean} data.synced - Whether the entry is synced with the host
   */
  constructor(data = {}) {
    this.id = data.id || uuid.v4();
    this.vasaNumber = data.vasaNumber || '';
    this.emoNumber = data.emoNumber || '';
    this.groupId = data.groupId || null;
    this.createdBy = data.createdBy || null;
    this.creatorName = data.creatorName || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.synced = data.synced || false;
    this.updatedAt = data.updatedAt || this.createdAt;
    this.notes = data.notes || '';
  }

  /**
   * Validate the entry data
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validate() {
    return validateEntry({
      vasaNumber: this.vasaNumber,
      emoNumber: this.emoNumber,
      groupId: this.groupId,
    });
  }

  /**
   * Check if the entry is valid
   * @returns {boolean} - Whether the entry is valid
   */
  isValid() {
    const { isValid } = this.validate();
    return isValid;
  }

  /**
   * Convert entry to plain object for storage
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      vasaNumber: this.vasaNumber,
      emoNumber: this.emoNumber,
      groupId: this.groupId,
      createdBy: this.createdBy,
      creatorName: this.creatorName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      synced: this.synced,
      notes: this.notes,
    };
  }

  /**
   * Create Entry instance from plain object
   * @param {Object} obj - Plain object with entry data
   * @returns {Entry} - New Entry instance
   */
  static fromObject(obj) {
    return new Entry(obj);
  }

  /**
   * Mark the entry as synced
   * @returns {Entry} - This entry for chaining
   */
  markAsSynced() {
    this.synced = true;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update entry data
   * @param {Object} data - New entry data
   * @returns {Entry} - This entry for chaining
   */
  update(data) {
    if (data.vasaNumber !== undefined) {this.vasaNumber = data.vasaNumber;}
    if (data.emoNumber !== undefined) {this.emoNumber = data.emoNumber;}
    if (data.notes !== undefined) {this.notes = data.notes;}

    this.updatedAt = new Date().toISOString();
    this.synced = false; // Mark as not synced after update

    return this;
  }
}

export default Entry;