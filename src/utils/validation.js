import { VALIDATION } from './constants';

/**
 * Validation utility functions for form inputs and data across the application
 */

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result {isValid, message}
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, message: 'Käyttäjänimi on pakollinen' };
  }

  if (username.length < 3) {
    return { isValid: false, message: 'Käyttäjänimen on oltava vähintään 3 merkkiä pitkä' };
  }

  if (username.length > 20) {
    return { isValid: false, message: 'Käyttäjänimi saa olla enintään 20 merkkiä pitkä' };
  }

  if (!VALIDATION.USERNAME.test(username)) {
    return {
      isValid: false,
      message: 'Käyttäjänimi voi sisältää vain kirjaimia, numeroita ja alaviivoja',
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result {isValid, message}
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Salasana on pakollinen' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Salasanan on oltava vähintään 6 merkkiä pitkä' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate passwords match for registration/change
 * @param {string} password - Password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Object} - Validation result {isValid, message}
 */
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Salasanat eivät täsmää' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate vasa number (reindeer calf identifier)
 * @param {string} vasaNumber - Vasa number to validate
 * @returns {Object} - Validation result {isValid, message}
 */
export const validateVasaNumber = (vasaNumber) => {
  if (!vasaNumber || vasaNumber.trim() === '') {
    return { isValid: false, message: 'Vasan numero on pakollinen' };
  }

  if (vasaNumber.length > 20) {
    return { isValid: false, message: 'Vasan numero saa olla enintään 20 merkkiä pitkä' };
  }

  if (!VALIDATION.VASA_NUMBER.test(vasaNumber)) {
    return {
      isValid: false,
      message: 'Vasan numero voi sisältää vain kirjaimia, numeroita ja yhdysviivoja',
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate emo number (mother reindeer identifier)
 * @param {string} emoNumber - Emo number to validate
 * @returns {Object} - Validation result {isValid, message}
 */
export const validateEmoNumber = (emoNumber) => {
  if (!emoNumber || emoNumber.trim() === '') {
    return { isValid: false, message: 'Emon numero on pakollinen' };
  }

  if (emoNumber.length > 20) {
    return { isValid: false, message: 'Emon numero saa olla enintään 20 merkkiä pitkä' };
  }

  if (!VALIDATION.EMO_NUMBER.test(emoNumber)) {
    return {
      isValid: false,
      message: 'Emon numero voi sisältää vain kirjaimia, numeroita ja yhdysviivoja',
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate group name
 * @param {string} groupName - Group name to validate
 * @returns {Object} - Validation result {isValid, message}
 */
export const validateGroupName = (groupName) => {
  if (!groupName || groupName.trim() === '') {
    return { isValid: false, message: 'Ryhmän nimi on pakollinen' };
  }

  if (groupName.length < 3) {
    return { isValid: false, message: 'Ryhmän nimen on oltava vähintään 3 merkkiä pitkä' };
  }

  if (groupName.length > 30) {
    return { isValid: false, message: 'Ryhmän nimi saa olla enintään 30 merkkiä pitkä' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate complete entry
 * @param {Object} entry - Entry to validate {vasaNumber, emoNumber, ...}
 * @returns {Object} - Validation result {isValid, errors}
 */
export const validateEntry = (entry) => {
  const errors = [];

  if (!entry) {
    return { isValid: false, errors: ['Merkintä puuttuu'] };
  }

  // Validate vasa number
  const vasaResult = validateVasaNumber(entry.vasaNumber);
  if (!vasaResult.isValid) {
    errors.push(vasaResult.message);
  }

  // Validate emo number
  const emoResult = validateEmoNumber(entry.emoNumber);
  if (!emoResult.isValid) {
    errors.push(emoResult.message);
  }

  // Validate group ID
  if (!entry.groupId) {
    errors.push('Ryhmän tunniste puuttuu');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate group creation data
 * @param {Object} group - Group data {name, location, ...}
 * @returns {Object} - Validation result {isValid, errors}
 */
export const validateGroup = (group) => {
  const errors = [];

  if (!group) {
    return { isValid: false, errors: ['Ryhmätiedot puuttuvat'] };
  }

  // Validate group name
  const nameResult = validateGroupName(group.name);
  if (!nameResult.isValid) {
    errors.push(nameResult.message);
  }

  // Validate location
  if (!group.location) {
    errors.push('Sijaintitiedot puuttuvat');
  } else {
    if (typeof group.location.latitude !== 'number' || typeof group.location.longitude !== 'number') {
      errors.push('Virheelliset sijaintitiedot');
    }
  }

  // Validate owner
  if (!group.ownerId) {
    errors.push('Ryhmän omistajan tunniste puuttuu');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize a string input to protect against injection attacks
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) {return '';}

  // Basic sanitization to remove HTML tags and dangerous characters
  return String(input)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

/**
 * Validate location data
 * @param {Object} location - Location data {latitude, longitude}
 * @returns {Object} - Validation result {isValid, message}
 */
export const validateLocation = (location) => {
  if (!location) {
    return { isValid: false, message: 'Sijaintitiedot puuttuvat' };
  }

  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return { isValid: false, message: 'Virheelliset sijaintitiedot' };
  }

  // Check if coordinates are in valid range
  if (location.latitude < -90 || location.latitude > 90) {
    return { isValid: false, message: 'Leveysaste on virheellinen' };
  }

  if (location.longitude < -180 || location.longitude > 180) {
    return { isValid: false, message: 'Pituusaste on virheellinen' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate user registration data
 * @param {Object} user - User data {username, password, confirmPassword}
 * @returns {Object} - Validation result {isValid, errors}
 */
export const validateUserRegistration = (user) => {
  const errors = [];

  if (!user) {
    return { isValid: false, errors: ['Käyttäjätiedot puuttuvat'] };
  }

  // Validate username
  const usernameResult = validateUsername(user.username);
  if (!usernameResult.isValid) {
    errors.push(usernameResult.message);
  }

  // Validate password
  const passwordResult = validatePassword(user.password);
  if (!passwordResult.isValid) {
    errors.push(passwordResult.message);
  }

  // Validate passwords match
  const passwordsMatchResult = validatePasswordsMatch(user.password, user.confirmPassword);
  if (!passwordsMatchResult.isValid) {
    errors.push(passwordsMatchResult.message);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format validation errors for display
 * @param {Array|string} errors - Validation errors
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) {return '';}

  if (Array.isArray(errors)) {
    return errors.join('\n');
  }

  return String(errors);
};
