import uuid from 'react-native-uuid';
import { validateGroup } from '../utils/validation';

/**
 * Model class for vasausryhmä (reindeer herding group)
 */
class Group {
  /**
   * Create a new Group instance
   * @param {Object} data - Group data
   * @param {string} data.name - Group name
   * @param {Object} data.location - Group location {latitude, longitude}
   * @param {string} data.ownerId - ID of the group owner
   * @param {string} data.ownerName - Username of the group owner
   * @param {Array} data.members - IDs of group members
   * @param {Array} data.pendingMembers - Pending join requests [{userId, username, requestedAt, location}]
   * @param {string} data.id - Unique ID (generated if not provided)
   * @param {string} data.createdAt - Creation timestamp (current time if not provided)
   * @param {boolean} data.active - Whether the group is active
   */
  constructor(data = {}) {
    this.id = data.id || uuid.v4();
    this.name = data.name || '';
    this.location = data.location || null;
    this.ownerId = data.ownerId || null;
    this.ownerName = data.ownerName || '';
    this.members = data.members || [];
    this.pendingMembers = data.pendingMembers || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;
    this.active = data.active !== undefined ? data.active : true;
    this.description = data.description || '';
  }

  /**
   * Validate the group data
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validate() {
    return validateGroup({
      name: this.name,
      location: this.location,
      ownerId: this.ownerId,
    });
  }

  /**
   * Check if the group is valid
   * @returns {boolean} - Whether the group is valid
   */
  isValid() {
    const { isValid } = this.validate();
    return isValid;
  }

  /**
   * Convert group to plain object for storage
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      ownerId: this.ownerId,
      ownerName: this.ownerName,
      members: [...this.members],
      pendingMembers: [...this.pendingMembers],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      active: this.active,
      description: this.description,
    };
  }

  /**
   * Create Group instance from plain object
   * @param {Object} obj - Plain object with group data
   * @returns {Group} - New Group instance
   */
  static fromObject(obj) {
    return new Group(obj);
  }

  /**
   * Add member to the group
   * @param {string} userId - User ID to add
   * @returns {boolean} - Whether the user was added
   */
  addMember(userId) {
    if (!userId || this.members.includes(userId)) {
      return false;
    }

    this.members.push(userId);
    this.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Remove member from the group
   * @param {string} userId - User ID to remove
   * @returns {boolean} - Whether the user was removed
   */
  removeMember(userId) {
    if (!userId || !this.members.includes(userId)) {
      return false;
    }

    this.members = this.members.filter(id => id !== userId);
    this.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Add pending join request
   * @param {Object} request - Join request {userId, username, requestedAt, location}
   * @returns {boolean} - Whether the request was added
   */
  addPendingRequest(request) {
    if (!request || !request.userId) {
      return false;
    }

    // Check if already a member
    if (this.members.includes(request.userId)) {
      return false;
    }

    // Check if already pending
    if (this.pendingMembers.some(p => p.userId === request.userId)) {
      return false;
    }

    this.pendingMembers.push({
      userId: request.userId,
      username: request.username || '',
      requestedAt: request.requestedAt || new Date().toISOString(),
      location: request.location || null,
    });

    this.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Accept a pending join request
   * @param {string} userId - User ID to accept
   * @returns {boolean} - Whether the request was accepted
   */
  acceptPendingRequest(userId) {
    if (!userId) {
      return false;
    }

    const pendingIndex = this.pendingMembers.findIndex(p => p.userId === userId);

    if (pendingIndex === -1) {
      return false;
    }

    // Remove from pending
    const pendingMember = this.pendingMembers[pendingIndex];
    this.pendingMembers.splice(pendingIndex, 1);

    // Add to members
    this.members.push(pendingMember.userId);
    this.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * Reject a pending join request
   * @param {string} userId - User ID to reject
   * @returns {boolean} - Whether the request was rejected
   */
  rejectPendingRequest(userId) {
    if (!userId) {
      return false;
    }

    const pendingIndex = this.pendingMembers.findIndex(p => p.userId === userId);

    if (pendingIndex === -1) {
      return false;
    }

    // Remove from pending
    this.pendingMembers.splice(pendingIndex, 1);
    this.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * Check if user is a member of the group
   * @param {string} userId - User ID to check
   * @returns {boolean} - Whether the user is a member
   */
  isMember(userId) {
    if (!userId) {return false;}

    return this.members.includes(userId) || this.ownerId === userId;
  }

  /**
   * Check if user is the owner of the group
   * @param {string} userId - User ID to check
   * @returns {boolean} - Whether the user is the owner
   */
  isOwner(userId) {
    if (!userId) {return false;}

    return this.ownerId === userId;
  }

  /**
   * Get total member count including owner
   * @returns {number} - Total member count
   */
  getMemberCount() {
    return this.members.length + 1; // +1 for owner
  }
}

export default Group;