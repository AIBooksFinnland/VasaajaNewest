import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service class for handling persistent data storage operations
 * This provides a central interface for all AsyncStorage operations
 * and adds features like data expiration, serialization, and error handling
 */
class StorageService {
  /**
   * Store data with an optional expiration time
   * @param {string} key - The storage key
   * @param {any} value - The data to store (will be JSON serialized)
   * @param {number} expirationInHours - Optional expiration time in hours
   * @returns {Promise<boolean>} - Success status
   */
  async setItem(key, value, expirationInHours = null) {
    try {
      const item = {
        value,
        timestamp: new Date().getTime(),
      };

      // Add expiration if specified
      if (expirationInHours) {
        item.expiration = expirationInHours * 60 * 60 * 1000; // Convert to milliseconds
      }

      // Store serialized data
      await AsyncStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error storing data for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Retrieve data from storage, checking for expiration
   * @param {string} key - The storage key
   * @returns {Promise<any>} - The stored value or null if expired/not found
   */
  async getItem(key) {
    try {
      const json = await AsyncStorage.getItem(key);

      if (!json) {return null;}

      const item = JSON.parse(json);
      const now = new Date().getTime();

      // Check for expiration
      if (item.expiration && (now - item.timestamp > item.expiration)) {
        // Data has expired, remove it
        await this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`Error retrieving data for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove data from storage
   * @param {string} key - The storage key
   * @returns {Promise<boolean>} - Success status
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all app data from storage
   * @returns {Promise<boolean>} - Success status
   */
  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  /**
   * Get all keys stored by the app
   * @returns {Promise<string[]>} - Array of storage keys
   */
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Get multiple items from storage at once
   * @param {string[]} keys - Array of storage keys
   * @returns {Promise<Object>} - Object with key-value pairs
   */
  async multiGet(keys) {
    try {
      const result = {};
      const items = await AsyncStorage.multiGet(keys);

      for (const [key, value] of items) {
        if (value) {
          const item = JSON.parse(value);
          const now = new Date().getTime();

          // Check for expiration
          if (!item.expiration || (now - item.timestamp <= item.expiration)) {
            result[key] = item.value;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error retrieving multiple items:', error);
      return {};
    }
  }

  /**
   * Store multiple items at once
   * @param {Object} items - Object with key-value pairs to store
   * @param {number} expirationInHours - Optional expiration time in hours
   * @returns {Promise<boolean>} - Success status
   */
  async multiSet(items, expirationInHours = null) {
    try {
      const pairs = [];
      const now = new Date().getTime();

      for (const [key, value] of Object.entries(items)) {
        const item = {
          value,
          timestamp: now,
        };

        if (expirationInHours) {
          item.expiration = expirationInHours * 60 * 60 * 1000;
        }

        pairs.push([key, JSON.stringify(item)]);
      }

      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error storing multiple items:', error);
      return false;
    }
  }

  /**
   * Remove multiple items from storage
   * @param {string[]} keys - Array of keys to remove
   * @returns {Promise<boolean>} - Success status
   */
  async multiRemove(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error removing multiple items:', error);
      return false;
    }
  }

  /**
   * Check if an item exists and is not expired
   * @param {string} key - The storage key
   * @returns {Promise<boolean>} - Whether the item exists and is valid
   */
  async hasValidItem(key) {
    try {
      const value = await this.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update part of an object stored in AsyncStorage
   * @param {string} key - The storage key
   * @param {Object} updates - Object with properties to update
   * @returns {Promise<boolean>} - Success status
   */
  async updateItem(key, updates) {
    try {
      const currentValue = await this.getItem(key);

      if (currentValue === null) {return false;}

      // Only update if the current value is an object
      if (typeof currentValue !== 'object' || currentValue === null) {
        throw new Error(`Cannot update non-object value for key "${key}"`);
      }

      // Create updated value by merging current value and updates
      const updatedValue = { ...currentValue, ...updates };

      // Get the original item to preserve expiration settings
      const json = await AsyncStorage.getItem(key);
      const item = JSON.parse(json);

      // Store the updated value with original expiration
      const expirationInHours = item.expiration
        ? (item.expiration / (60 * 60 * 1000))
        : null;

      return await this.setItem(key, updatedValue, expirationInHours);
    } catch (error) {
      console.error(`Error updating item for key "${key}":`, error);
      return false;
    }
  }
}

// Export a singleton instance
export default new StorageService();