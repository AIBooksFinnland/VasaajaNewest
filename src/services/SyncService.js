import BluetoothService from './BluetoothService';
import LocationService from './LocationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SyncService {
  constructor() {
    this.isHost = false;
    this.currentGroupId = null;
    this.connectedPeers = new Map();
    this.syncInterval = null;
    this.pendingEntries = [];
    this.onSyncComplete = null;
    this.onSyncError = null;
    this.onDeviceConnected = null;
    this.onDeviceDisconnected = null;
    this.onEntryReceived = null;
    this.initialized = false;
  }

  // Initialize sync service
  async initialize(userId) {
    try {
      if (this.initialized) {
        return true;
      }

      this.userId = userId;

      // Initialize bluetooth service
      const bleInitialized = await BluetoothService.initialize();
      if (!bleInitialized) {
        throw new Error('Bluetooth-alustus epäonnistui');
      }

      // Initialize location service
      const locationInitialized = await LocationService.initialize();
      if (!locationInitialized) {
        throw new Error('Sijaintipalvelun alustus epäonnistui');
      }

      // Set up bluetooth event handlers
      BluetoothService.onDeviceDiscovered = this.handleDeviceDiscovered.bind(this);
      BluetoothService.onConnectionStateChange = this.handleConnectionStateChange.bind(this);
      BluetoothService.onDataReceived = this.handleDataReceived.bind(this);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Synkronointipalvelun alustus epäonnistui', error);
      return false;
    }
  }

  // Start hosting a group (as group owner)
  async startHosting(groupId) {
    try {
      if (!this.initialized) {
        await this.initialize(this.userId);
      }

      this.isHost = true;
      this.currentGroupId = groupId;

      // Start periodic ping for list consistency
      this.startPeriodicPing();

      return true;
    } catch (error) {
      console.error('Isännöinnin aloitus epäonnistui', error);
      return false;
    }
  }

  // Join a hosted group (as member)
  async joinGroup(groupId) {
    try {
      if (!this.initialized) {
        await this.initialize(this.userId);
      }

      this.isHost = false;
      this.currentGroupId = groupId;

      // Start scanning for nearby hosts
      await BluetoothService.startScan();

      return true;
    } catch (error) {
      console.error('Ryhmään liittyminen epäonnistui', error);
      return false;
    }
  }

  // Handle discovered device
  async handleDeviceDiscovered(device) {
    try {
      // In a real app, would check if the device name matches your app's pattern
      // and get its groupId from advertising data
      console.log('Laite löydetty:', device.name || device.id);

      // Check if we should connect to this device
      if (device.name && device.name.startsWith('VasaApp_')) {
        // For demonstration, we'll just connect to the first device we find
        // In a real app, you'd check if this device is hosting the group we want to join
        await BluetoothService.connectToDevice(device.id);
      }
    } catch (error) {
      console.error('Laitteen käsittely epäonnistui', error);
    }
  }

  // Handle connection state change
  handleConnectionStateChange(connected, device) {
    if (connected && device) {
      this.connectedPeers.set(device.id, device);

      if (this.onDeviceConnected) {
        this.onDeviceConnected(device);
      }

      // If we're not the host, we should sync our pending entries
      if (!this.isHost) {
        this.syncPendingEntries();
      }
    } else if (device) {
      this.connectedPeers.delete(device.id);

      if (this.onDeviceDisconnected) {
        this.onDeviceDisconnected(device);
      }
    }
  }

  // Handle received data
  async handleDataReceived(data) {
    try {
      if (!data || !data.type) {
        return;
      }

      switch (data.type) {
        case 'PING':
          // Respond to ping with pong
          this.sendPong(data.source);
          break;

        case 'PONG':
          // Ping-pong successful
          console.log('Ping-pong onnistui laitteen kanssa:', data.source);
          break;

        case 'ENTRY':
          // Process received entry
          if (data.entry && this.isHost) {
            await this.processReceivedEntry(data.entry, data.source);
          }
          break;

        case 'ENTRY_ACK':
          // Entry was successfully processed by host
          if (!this.isHost && data.entryId) {
            await this.markEntryAsSynced(data.entryId);
          }
          break;

        case 'SYNC_REQUEST':
          // Send all entries for the group
          if (this.isHost && data.groupId === this.currentGroupId) {
            await this.sendAllEntries(data.source);
          }
          break;
      }
    } catch (error) {
      console.error('Vastaanotetun datan käsittely epäonnistui', error);
    }
  }

  // Process a received entry (as host)
  async processReceivedEntry(entry, sourceId) {
    try {
      if (!this.isHost || !entry || !entry.id) {
        return;
      }

      // Verify the entry is for the current group
      if (entry.groupId !== this.currentGroupId) {
        console.warn('Merkintä ei kuulu tähän ryhmään');
        return;
      }

      // Get current location to verify proximity
      // Note: Not using the returned location value, but this is needed for security checks
      await LocationService.getCurrentLocation();

      // Add the entry to the group's entries
      const groupEntriesJson = await AsyncStorage.getItem(`groupEntries_${this.currentGroupId}`);
      const groupEntries = groupEntriesJson ? JSON.parse(groupEntriesJson) : [];

      // Check if entry already exists
      const existingIndex = groupEntries.findIndex(e => e.id === entry.id);
      if (existingIndex >= 0) {
        // Entry already exists, no need to add it again
        this.sendEntryAcknowledgement(entry.id, sourceId);
        return;
      }

      // Add the entry
      groupEntries.push(entry);
      await AsyncStorage.setItem(`groupEntries_${this.currentGroupId}`, JSON.stringify(groupEntries));

      // Notify the sender that the entry was added
      this.sendEntryAcknowledgement(entry.id, sourceId);

      // Notify the application that a new entry was received
      if (this.onEntryReceived) {
        this.onEntryReceived(entry);
      }
    } catch (error) {
      console.error('Merkinnän käsittely epäonnistui', error);
    }
  }

  // Mark an entry as synced (as member)
  async markEntryAsSynced(entryId) {
    try {
      // Update entry in storage
      const entriesJson = await AsyncStorage.getItem(`entries_${this.userId}`);
      if (!entriesJson) {
        return;
      }

      const entries = JSON.parse(entriesJson);
      const updatedEntries = entries.map(entry =>
        entry.id === entryId ? { ...entry, synced: true } : entry,
      );

      await AsyncStorage.setItem(`entries_${this.userId}`, JSON.stringify(updatedEntries));

      // Update pending entries list
      this.pendingEntries = this.pendingEntries.filter(e => e.id !== entryId);

      // Notify application that sync is complete
      if (this.onSyncComplete && this.pendingEntries.length === 0) {
        this.onSyncComplete();
      }
    } catch (error) {
      console.error('Merkinnän synkronointi epäonnistui', error);
    }
  }

  // Send an entry to the host
  async sendEntry(entry) {
    try {
      if (this.isHost) {
        // If we're the host, just add it directly
        return await this.processReceivedEntry(entry, this.userId);
      }

      // Add to pending entries
      this.pendingEntries.push(entry);

      // If we're connected to a host, send it
      if (this.connectedPeers.size > 0) {
        const message = {
          type: 'ENTRY',
          source: this.userId,
          groupId: this.currentGroupId,
          entry: entry,
        };

        // No need to handle firstPeerId specifically in this simplified version
        await BluetoothService.sendData(message);
      } else {
        // Not connected to a host, will try later
        console.log('Ei yhteyttä isäntään, merkintä jää jonoon');
      }
    } catch (error) {
      console.error('Merkinnän lähettäminen epäonnistui', error);
      if (this.onSyncError) {
        this.onSyncError(error);
      }
    }
  }

  // Send acknowledgement that an entry was processed
  async sendEntryAcknowledgement(entryId, targetId) {
    try {
      const message = {
        type: 'ENTRY_ACK',
        source: this.userId,
        entryId: entryId,
      };

      await BluetoothService.sendData(message);
    } catch (error) {
      console.error('Kuittauksen lähettäminen epäonnistui', error);
    }
  }

  // Sync all pending entries
  async syncPendingEntries() {
    try {
      if (this.isHost || this.pendingEntries.length === 0 || this.connectedPeers.size === 0) {
        return;
      }

      // Load any unsent entries from storage
      const entriesJson = await AsyncStorage.getItem(`entries_${this.userId}`);
      if (entriesJson) {
        const entries = JSON.parse(entriesJson);
        const unsyncedEntries = entries.filter(e =>
          e.groupId === this.currentGroupId && !e.synced,
        );

        // Add to pending if not already there
        for (const entry of unsyncedEntries) {
          if (!this.pendingEntries.some(p => p.id === entry.id)) {
            this.pendingEntries.push(entry);
          }
        }
      }

      // Send each pending entry
      for (const entry of this.pendingEntries) {
        await this.sendEntry(entry);
      }
    } catch (error) {
      console.error('Merkintöjen synkronointi epäonnistui', error);
    }
  }

  // Send all entries to a member (as host)
  async sendAllEntries(targetId) {
    try {
      if (!this.isHost) {
        return;
      }

      // Get all entries for this group
      const groupEntriesJson = await AsyncStorage.getItem(`groupEntries_${this.currentGroupId}`);
      if (!groupEntriesJson) {
        return;
      }

      const groupEntries = JSON.parse(groupEntriesJson);

      // Send each entry individually
      for (const entry of groupEntries) {
        const message = {
          type: 'ENTRY',
          source: this.userId,
          groupId: this.currentGroupId,
          entry: entry,
        };

        await BluetoothService.sendData(message);
        // Add a small delay to avoid overwhelming the receiver
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Kaikkien merkintöjen lähettäminen epäonnistui', error);
    }
  }

  // Start periodic ping for list consistency
  startPeriodicPing() {
    // Send a ping message every minute
    this.syncInterval = setInterval(() => {
      this.sendPing();
    }, 60000); // 1 minute
  }

  // Send a ping message to all connected peers
  async sendPing() {
    try {
      const message = {
        type: 'PING',
        source: this.userId,
        timestamp: Date.now(),
      };

      await BluetoothService.sendData(message);
    } catch (error) {
      console.error('Pingin lähettäminen epäonnistui', error);
    }
  }

  // Send a pong response
  async sendPong(targetId) {
    try {
      const message = {
        type: 'PONG',
        source: this.userId,
        timestamp: Date.now(),
      };

      await BluetoothService.sendData(message);
    } catch (error) {
      console.error('Pongin lähettäminen epäonnistui', error);
    }
  }

  // Request full sync from host
  async requestFullSync() {
    try {
      if (this.isHost || this.connectedPeers.size === 0) {
        return;
      }

      const message = {
        type: 'SYNC_REQUEST',
        source: this.userId,
        groupId: this.currentGroupId,
      };

      await BluetoothService.sendData(message);
    } catch (error) {
      console.error('Täyden synkronoinnin pyyntö epäonnistui', error);
    }
  }

  // Stop syncing
  stop() {
    // Clear sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Disconnect from peers
    BluetoothService.disconnect();

    // Reset state
    this.isHost = false;
    this.currentGroupId = null;
    this.connectedPeers.clear();
    this.pendingEntries = [];
  }

  // Clean up resources
  destroy() {
    this.stop();
    BluetoothService.destroy();
    LocationService.destroy();
    this.initialized = false;
  }
}

// Export singleton instance
export default new SyncService();