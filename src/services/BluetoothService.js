import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { BLUETOOTH } from '../utils/constants';

// Create a Buffer polyfill using base64 for React Native 0.79
const Buffer = {
  from: (str, encoding) => {
    if (encoding === 'utf8') {
      return {
        toString: (outputEncoding) => {
          if (outputEncoding === 'base64') {
            return btoa(unescape(encodeURIComponent(str)));
          }
          return str;
        }
      };
    } else if (encoding === 'base64') {
      return {
        toString: (outputEncoding) => {
          if (outputEncoding === 'utf8') {
            return decodeURIComponent(escape(atob(str)));
          }
          return atob(str);
        }
      };
    }
    return { toString: () => str };
  }
};

// Extract UUIDs from constants
const { SERVICE_UUID, CHARACTERISTIC_UUID } = BLUETOOTH;

class BluetoothService {
  constructor() {
    this.manager = new BleManager();
    this.devices = new Map();
    this.connectedDevice = null;
    this.isScanning = false;
    this.isAdvertising = false;
    this.onDeviceDiscovered = null;
    this.onConnectionStateChange = null;
    this.onDataReceived = null;
    this.deviceName = `VasaApp_${uuid.v4().substring(0, 8)}`;
    this.stateSubscription = null;
  }

  // Request Bluetooth permissions on Android
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          // For Android 12+
          ...(parseInt(Platform.Version, 10) >= 31
            ? [
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
              ]
            : []
          ),
        ]);

        return Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED,
        );
      } catch (error) {
        console.error('Failed to request permissions', error);
        return false;
      }
    }
    return true; // iOS will prompt automatically
  }

  // Initialize Bluetooth service
  async initialize() {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth-oikeuksia ei myönnetty');
      }

      // Setup state change listener
      this.stateSubscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          if (this.stateSubscription) {
            this.stateSubscription.remove();
          }
        }
      }, true);

      return true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth', error);
      return false;
    }
  }

  // Start scanning for nearby devices
  async startScan() {
    try {
      if (this.isScanning) {return;}

      // Clear previous devices
      this.devices.clear();

      // Start scanning
      this.isScanning = true;

      this.manager.startDeviceScan(
        [SERVICE_UUID], // Filter by service UUID
        null,
        (error, device) => {
          if (error) {
            console.error('Scan error', error);
            this.isScanning = false;
            return;
          }

          if (device && !this.devices.has(device.id)) {
            this.devices.set(device.id, device);
            if (this.onDeviceDiscovered) {
              this.onDeviceDiscovered(device);
            }
          }
        },
      );

      // Auto-stop scan after 30 seconds
      setTimeout(() => {
        this.stopScan();
      }, BLUETOOTH.SCAN_TIMEOUT);

      return true;
    } catch (error) {
      console.error('Failed to start scan', error);
      this.isScanning = false;
      return false;
    }
  }

  // Stop scanning
  stopScan() {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    try {
      this.stopScan();

      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error('Laitetta ei löydy');
      }

      // Connect to device
      const connectedDevice = await device.connect({
        timeout: BLUETOOTH.CONNECTION_TIMEOUT,
      });

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Setup notification listener for receiving data
      await this.setupNotifications(connectedDevice);

      this.connectedDevice = connectedDevice;

      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(true, connectedDevice);
      }

      return connectedDevice;
    } catch (error) {
      console.error('Failed to connect', error);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(false, null);
      }
      return null;
    }
  }

  // Setup notifications to receive data
  async setupNotifications(device) {
    try {
      // Monitor characteristic for incoming data
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Notification error', error);
            return;
          }

          if (characteristic?.value) {
            const data = this.decodeBase64(characteristic.value);
            if (this.onDataReceived) {
              this.onDataReceived(data);
            }
          }
        },
      );
    } catch (error) {
      console.error('Failed to setup notifications', error);
    }
  }

  // Send data to connected device
  async sendData(data) {
    try {
      if (!this.connectedDevice) {
        throw new Error('Ei yhdistettyä laitetta');
      }

      // Convert data to Base64
      const base64Data = this.encodeBase64(JSON.stringify(data));

      // Write the data to characteristic
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Data,
      );

      return true;
    } catch (error) {
      console.error('Failed to send data', error);
      return false;
    }
  }

  // Disconnect from device
  async disconnect() {
    try {
      if (this.connectedDevice) {
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;

        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(false, null);
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to disconnect', error);
      return false;
    }
  }

  // Clean up resources
  destroy() {
    this.stopScan();
    this.disconnect();
    if (this.stateSubscription) {
      this.stateSubscription.remove();
    }
    this.manager.destroy();
  }

  // Utility function to encode string to Base64
  encodeBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  // Utility function to decode Base64 to string
  decodeBase64(base64) {
    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Failed to decode data', error);
      return null;
    }
  }
}

// Export singleton instance
export default new BluetoothService();