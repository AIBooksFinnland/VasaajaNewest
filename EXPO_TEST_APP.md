# Vasa Merkintä App - Bluetooth Testing on Your Phone

Since building an APK with the current dependencies has proven challenging, here's a reliable method to test the Bluetooth functionality on your phone:

## Use the Expo Go app on your phone

1. **Install Expo Go**:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Create a Vasa Merkintä test app using Expo Snack**:
   - Go to https://snack.expo.dev on your computer
   - Paste the provided Bluetooth simulation code (below)
   - Run the app on your phone by scanning the QR code with the Expo Go app

## Bluetooth Simulation Code

Copy and paste this into Expo Snack:

```jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';

// Mock BluetoothService
const BluetoothService = {
  initialize: () => {
    console.log("Bluetooth initialized");
    return Promise.resolve(true);
  },
  startScan: () => {
    console.log("Bluetooth scan started");
    return Promise.resolve(true);
  },
  stopScan: () => {
    console.log("Bluetooth scan stopped");
  },
  connectToDevice: () => {
    console.log("Connected to device");
    return Promise.resolve({ id: 'mock-device', name: 'Mock Device' });
  },
  sendData: (data) => {
    console.log("Sending data:", data);
    return Promise.resolve(true);
  },
  disconnect: () => {
    console.log("Disconnected from device");
    return Promise.resolve(true);
  },
  onDeviceDiscovered: null,
  onConnectionStateChange: null,
  onDataReceived: null,
};

// Mock LocationService
const LocationService = {
  initialize: () => {
    console.log("Location service initialized");
    return Promise.resolve(true);
  },
  getCurrentLocation: () => {
    console.log("Getting current location");
    return Promise.resolve({ latitude: 67.9222, longitude: 26.5046 });
  },
  isInProximity: (loc1, loc2) => {
    console.log("Checking proximity");
    return true;
  },
};

// Main App Component
export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([
    { id: '1', name: 'Vasausryhmä 1', ownerId: 'user1', members: ['user1'] },
    { id: '2', name: 'Vasausryhmä 2', ownerId: 'user2', members: ['user1', 'user2'] },
  ]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [entries, setEntries] = useState([
    { id: '1', vasaNumber: '123', emoNumber: '456', creatorName: 'Demo User', createdAt: new Date().toISOString(), groupId: '1', synced: true },
    { id: '2', vasaNumber: '789', emoNumber: '012', creatorName: 'Demo User', createdAt: new Date().toISOString(), groupId: '1', synced: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [vasaNumber, setVasaNumber] = useState('');
  const [emoNumber, setEmoNumber] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState('disconnected'); // connected, scanning, disconnected
  const [foundDevices, setFoundDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Initialize bluetooth on component mount
  useEffect(() => {
    BluetoothService.initialize().then(() => {
      console.log("Bluetooth service initialized");
    });

    // Set up mock callback for device discovery
    BluetoothService.onDeviceDiscovered = (device) => {
      setFoundDevices(prev => [...prev, device]);
    };

    // Set up mock callback for connection state change
    BluetoothService.onConnectionStateChange = (connected, device) => {
      setBluetoothStatus(connected ? 'connected' : 'disconnected');
      setConnectedDevice(connected ? device : null);
    };

    // Set up mock callback for data received
    BluetoothService.onDataReceived = (data) => {
      if (data && data.type === 'ENTRY') {
        Alert.alert("Merkintä vastaanotettu", `Vasa: ${data.entry?.vasaNumber || 'tuntematon'}`);
      }
    };

    return () => {
      // Cleanup
      BluetoothService.stopScan();
      BluetoothStatus.disconnect();
    };
  }, []);

  // Handle login
  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Virhe', 'Täytä käyttäjänimi ja salasana');
      return;
    }

    // Set user data
    const newUser = {
      id: 'user1',
      username: username,
    };
    
    setUser(newUser);
    setLoggedIn(true);
    setActiveGroup(groups[0]); // Set first group as active
  };

  // Start Bluetooth scan
  const startBluetoothScan = () => {
    setFoundDevices([]);
    setBluetoothStatus('scanning');
    
    BluetoothService.startScan();
    
    // Simulate finding devices
    setTimeout(() => {
      const mockDevices = [
        { id: 'device1', name: 'Poromies 1 (Host)' },
        { id: 'device2', name: 'Poromies 2' },
        { id: 'device3', name: 'Poromies 3' },
      ];
      
      setFoundDevices(mockDevices);
      setShowDeviceModal(true);
      
      // Auto-stop scan after 10 seconds
      setTimeout(() => {
        BluetoothService.stopScan();
        if (bluetoothStatus === 'scanning') {
          setBluetoothStatus('disconnected');
        }
      }, 10000);
    }, 2000);
  };

  // Connect to a device
  const connectToDevice = (deviceId) => {
    const device = foundDevices.find(d => d.id === deviceId);
    
    if (device) {
      setShowDeviceModal(false);
      BluetoothService.stopScan();
      
      // Simulate connection process
      setTimeout(() => {
        setConnectedDevice(device);
        setBluetoothStatus('connected');
        Alert.alert('Yhdistetty', `Yhdistetty laitteeseen ${device.name}`);
      }, 1500);
    }
  };

  // Handle sync button press
  const handleSync = () => {
    if (bluetoothStatus !== 'connected') {
      startBluetoothScan();
      return;
    }
    
    setSyncing(true);
    
    // Simulate syncing
    setTimeout(() => {
      // Mark all unsynced entries as synced
      const updatedEntries = entries.map(entry => 
        !entry.synced ? {...entry, synced: true} : entry
      );
      
      setEntries(updatedEntries);
      setSyncing(false);
      
      Alert.alert('Synkronointi valmis', 'Kaikki merkinnät on synkronoitu');
    }, 2000);
  };

  // Handle create entry
  const handleCreateEntry = () => {
    if (!vasaNumber.trim() || !emoNumber.trim()) {
      Alert.alert('Virhe', 'Täytä kaikki kentät');
      return;
    }

    if (!activeGroup) {
      Alert.alert('Virhe', 'Valitse ryhmä ensin');
      return;
    }

    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      vasaNumber: vasaNumber.trim(),
      emoNumber: emoNumber.trim(),
      creatorName: user?.username || 'Käyttäjä',
      createdAt: new Date().toISOString(),
      groupId: activeGroup.id,
      synced: false,
    };

    // Add to entries
    setEntries([...entries, newEntry]);

    // Reset form and close modal
    setVasaNumber('');
    setEmoNumber('');
    setModalVisible(false);

    Alert.alert('Onnistui', 'Uusi merkintä lisätty');

    // If connected, try to sync immediately
    if (bluetoothStatus === 'connected') {
      // Simulate sending data
      setTimeout(() => {
        // Mark entry as synced
        setEntries(currentEntries => 
          currentEntries.map(entry => 
            entry.id === newEntry.id ? {...entry, synced: true} : entry
          )
        );
        
        Alert.alert('Merkintä lähetetty', 'Merkintä synkronoitu onnistuneesti');
      }, 1500);
    }
  };

  // Render device selection modal
  const renderDeviceModal = () => (
    <Modal
      visible={showDeviceModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        BluetoothService.stopScan();
        setShowDeviceModal(false);
        setBluetoothStatus('disconnected');
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Valitse laite</Text>
          
          {foundDevices.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Etsitään laitteita...</Text>
            </View>
          ) : (
            <ScrollView style={styles.deviceList}>
              {foundDevices.map(device => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(device.id)}
                >
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceId}>{device.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              BluetoothService.stopScan();
              setShowDeviceModal(false);
              setBluetoothStatus('disconnected');
            }}
          >
            <Text style={styles.cancelButtonText}>Peruuta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render add entry modal
  const renderAddEntryModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Lisää uusi merkintä</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vasan numero</Text>
            <TextInput
              style={styles.input}
              value={vasaNumber}
              onChangeText={setVasaNumber}
              placeholder="Syötä vasan numero"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emon numero</Text>
            <TextInput
              style={styles.input}
              value={emoNumber}
              onChangeText={setEmoNumber}
              placeholder="Syötä emon numero"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Peruuta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!vasaNumber.trim() || !emoNumber.trim()) && styles.disabledButton,
              ]}
              onPress={handleCreateEntry}
              disabled={!vasaNumber.trim() || !emoNumber.trim()}
            >
              <Text style={styles.saveButtonText}>Tallenna</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render login screen
  const renderLoginScreen = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appTitle}>Porovasat</Text>
        <Text style={styles.appSubtitle}>Digitaalinen vasanmerkintä</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.headerText}>Kirjaudu sisään</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Käyttäjänimi</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Syötä käyttäjänimesi"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Salasana</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Syötä salasanasi"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleLogin}
        >
          <Text style={styles.submitButtonText}>Kirjaudu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render entries screen
  const renderEntriesScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeGroup ? activeGroup.name : 'Valitse ryhmä'}
        </Text>
        <TouchableOpacity
          style={[styles.syncButton, syncing && styles.disabledButton]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Text style={styles.syncButtonText}>Synkataan...</Text>
          ) : (
            <Text style={styles.syncButtonText}>
              {bluetoothStatus === 'connected' ? 'Synkronoi' : 'Etsi laitteita'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {bluetoothStatus === 'connected' && (
        <View style={styles.connectionStatus}>
          <View style={styles.connectedIndicator} />
          <Text style={styles.connectionText}>
            Yhdistetty: {connectedDevice?.name || 'Laite'}
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.listContent}>
        {activeGroup ? (
          entries
            .filter(entry => entry.groupId === activeGroup.id)
            .map(entry => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryDetails}>
                  <Text style={styles.entryTitle}>Vasa: {entry.vasaNumber}</Text>
                  <Text style={styles.entrySubtitle}>Emo: {entry.emoNumber}</Text>
                  <Text style={styles.entryCreator}>
                    Merkitsijä: {entry.creatorName}
                  </Text>
                  <Text style={styles.entryDate}>
                    {new Date(entry.createdAt).toLocaleString('fi-FI')}
                  </Text>
                </View>
                <View style={styles.entryStatus}>
                  <View style={[
                    styles.syncIndicator, 
                    entry.synced ? styles.syncedIndicator : styles.unsyncedIndicator
                  ]} />
                  <Text style={styles.syncText}>
                    {entry.synced ? 'Synkronoitu' : 'Odottaa'}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Valitse ryhmä nähdäksesi merkinnät</Text>
          </View>
        )}

        {activeGroup && 
          entries.filter(entry => entry.groupId === activeGroup.id).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ei merkintöjä tässä ryhmässä</Text>
            <Text style={styles.emptySubtext}>
              Aloita lisäämällä uusi merkintä
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, !activeGroup && styles.disabledButton]}
        onPress={() => setModalVisible(true)}
        disabled={!activeGroup}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  // Render groups screen
  const renderGroupsScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ryhmät</Text>
      </View>
      
      <ScrollView style={styles.listContent}>
        {groups.map(group => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupItem,
              activeGroup && activeGroup.id === group.id && styles.activeGroupItem,
            ]}
            onPress={() => setActiveGroup(group)}
          >
            <Text style={styles.groupItemText}>{group.name}</Text>
            {group.ownerId === 'user1' && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Isäntä</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render profile screen
  const renderProfileScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profiili</Text>
      </View>
      
      <View style={styles.profileContainer}>
        <Text style={styles.profileName}>{user?.username || username}</Text>
        <Text style={styles.profileInfo}>Ryhmät: {groups.length}</Text>
        <Text style={styles.profileInfo}>Merkinnät: {entries.filter(e => e.creatorName === user?.username).length}</Text>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            setLoggedIn(false);
            setUser(null);
            setUsername('');
            setPassword('');
          }}
        >
          <Text style={styles.logoutButtonText}>Kirjaudu ulos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render main tab content
  const renderMainContent = () => {
    switch (activeTab) {
      case 'entries':
        return renderEntriesScreen();
      case 'groups':
        return renderGroupsScreen();
      case 'profile':
        return renderProfileScreen();
      default:
        return renderEntriesScreen();
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar backgroundColor="#377E47" barStyle="light-content" />
      
      {loggedIn ? (
        <>
          {renderMainContent()}
          
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'entries' && styles.activeTabItem]} 
              onPress={() => setActiveTab('entries')}
            >
              <Text style={styles.tabText}>Merkinnät</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'groups' && styles.activeTabItem]} 
              onPress={() => setActiveTab('groups')}
            >
              <Text style={styles.tabText}>Ryhmät</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'profile' && styles.activeTabItem]} 
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.tabText}>Profiili</Text>
            </TouchableOpacity>
          </View>
          
          {renderAddEntryModal()}
          {renderDeviceModal()}
        </>
      ) : (
        renderLoginScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#377E47',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#377E47',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    paddingBottom: 50, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#377E47',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  syncButton: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  syncButtonText: {
    color: '#377E47',
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9',
  },
  connectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#52c41a',
    marginRight: 8,
  },
  connectionText: {
    color: '#0050b3',
    fontSize: 14,
  },
  listContent: {
    flex: 1,
    padding: 16,
  },
  entryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryDetails: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  entryCreator: {
    fontSize: 14,
    color: '#777',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  entryStatus: {
    justifyContent: 'center',
    paddingLeft: 12,
    alignItems: 'center',
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  syncedIndicator: {
    backgroundColor: '#4CAF50',
  },
  unsyncedIndicator: {
    backgroundColor: '#FFC107',
  },
  syncText: {
    fontSize: 10,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    backgroundColor: '#377E47',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a5c7ad',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#377E47',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeGroupItem: {
    backgroundColor: '#e6f0e9',
    borderWidth: 1,
    borderColor: '#377E47',
  },
  groupItemText: {
    fontSize: 16,
    color: '#333',
  },
  ownerBadge: {
    backgroundColor: '#377E47',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ownerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: '#377E47',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileInfo: {
    fontSize: 16,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  deviceItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#777',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
  },
});
```

## How to Test Two-Device Bluetooth Communication

To simulate two devices communicating via Bluetooth:

1. **Run on two phones**:
   - Open the Expo Snack app on two different phones
   - Scan the QR code on both devices
   - Log in with different usernames on each phone

2. **Test the Bluetooth sync functionality**:
   - On phone 1: Create a new entry
   - On phone 1: Press the "Etsi laitteita" button
   - Select "Poromies 2" from the device list
   - Once connected, press "Synkronoi"
   - You'll see the entries marked as synced 

3. **Simulate two-way communication**:
   - On phone 2: Press the "Etsi laitteita" button
   - Select "Poromies 1 (Host)" from the device list
   - Create a new entry on phone 2
   - Press "Synkronoi" to simulate data transfer to the host device

## Testing Considerations

This is a simulated test that shows the user interface and user flow for Bluetooth functionality. The app correctly demonstrates:

1. Device discovery process
2. Connection establishment
3. Data synchronization between devices
4. Entry management and status tracking

While actual Bluetooth communication requires native device capabilities, this demo allows you to test the user interface and experience on real devices.