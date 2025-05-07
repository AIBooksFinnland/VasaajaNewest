import uuid from 'react-native-uuid';
import { validateUsername, validatePassword } from '../utils/validation';

/**
 * Model class for user
 */
class User {
  /**
   * Create a new User instance
   * @param {Object} data - User data
   * @param {string} data.username - Username
   * @param {string} data.password - Password (should be hashed in a real app)
   * @param {string} data.id - Unique ID (generated if not provided)
   * @param {string} data.createdAt - Creation timestamp (current time if not provided)
   */
  constructor(data = {}) {
    this.id = data.id || uuid.v4();
    this.username = data.username || '';
    this.password = data.password || ''; // In a real app, this should be hashed
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;
    this.lastLogin = data.lastLogin || null;
    this.settings = data.settings || {
      bluetoothEnabled: true,
      locationEnabled: true,
      syncInterval: 60, // seconds
    };
  }

  /**
   * Validate user data
   * @returns {Object} - {isValid: boolean, errors: Array}
   */
  validate() {
    const errors = [];

    const usernameResult = validateUsername(this.username);
    if (!usernameResult.isValid) {
      errors.push(usernameResult.message);
    }

    const passwordResult = validatePassword(this.password);
    if (!passwordResult.isValid) {
      errors.push(passwordResult.message);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if the user is valid
   * @returns {boolean} - Whether the user is valid
   */
  isValid() {
    const { isValid } = this.validate();
    return isValid;
  }

  /**
   * Convert user to plain object for storage
   * @param {boolean} includePassword - Whether to include password in the output
   * @returns {Object} - Plain object representation
   */
  toObject(includePassword = true) {
    const obj = {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
      settings: { ...this.settings },
    };

    if (includePassword) {
      obj.password = this.password;
    }

    return obj;
  }

  /**
   * Create User instance from plain object
   * @param {Object} obj - Plain object with user data
   * @returns {User} - New User instance
   */
  static fromObject(obj) {
    return new User(obj);
  }

  /**
   * Update user data
   * @param {Object} data - New user data
   * @returns {User} - This user for chaining
   */
  update(data) {
    if (data.username !== undefined) {this.username = data.username;}
    if (data.password !== undefined) {this.password = data.password;}
    if (data.settings !== undefined) {this.settings = { ...this.settings, ...data.settings };}

    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Update user settings
   * @param {Object} settings - New settings
   * @returns {User} - This user for chaining
   */
  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Record a login
   * @returns {User} - This user for chaining
   */
  recordLogin() {
    this.lastLogin = new Date().toISOString();
    return this;
  }

  /**
   * Check if password matches
   * @param {string} password - Password to check
   * @returns {boolean} - Whether the password matches
   */
  checkPassword(password) {
    // In a real app, this would compare hashed passwords
    return this.password === password;
  }

  /**
   * Get a safe version of user without sensitive data
   * @returns {Object} - Safe user object
   */
  getSafeUser() {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
    };
  }
}

export default User;