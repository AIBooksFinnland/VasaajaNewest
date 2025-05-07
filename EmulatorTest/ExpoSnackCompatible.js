import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Mock BluetoothService for Expo Snack compatibility
const BluetoothServiceMock = {
  initialize: () => Promise.resolve(true),
  startScan: () => Promise.resolve(true),
  stopScan: () => {},
  connectToDevice: () => Promise.resolve({ id: 'mock-device-id', name: 'Mock Device' }),
  sendData: () => Promise.resolve(true),
  disconnect: () => Promise.resolve(true),
};

// Mock LocationService for Expo Snack compatibility
const LocationServiceMock = {
  initialize: () => Promise.resolve(true),
  getCurrentLocation: () => Promise.resolve({ latitude: 68.4202, longitude: 27.4103 }),
  isInProximity: () => true,
};

// Mock SyncService for Expo Snack compatibility
const SyncServiceMock = {
  initialize: () => Promise.resolve(true),
  startHosting: () => Promise.resolve(true),
  joinGroup: () => Promise.resolve(true),
  sendEntry: () => Promise.resolve(true),
  syncPendingEntries: () => Promise.resolve(true),
};

// Demo App compatible with Expo Snack
const ExpoSnackApp = () => {
  // State variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');
  const [entries, setEntries] = useState([
    { 
      id: '1', 
      vasaNumber: '123', 
      emoNumber: '456', 
      creatorName: 'Demo User', 
      createdAt: new Date().toISOString(),
      groupId: 'group1',
      synced: true 
    },
    { 
      id: '2', 
      vasaNumber: '789', 
      emoNumber: '012', 
      creatorName: 'Demo User', 
      createdAt: new Date().toISOString(),
      groupId: 'group1',
      synced: false 
    },
  ]);
  const [groups, setGroups] = useState([
    { id: 'group1', name: 'Vasausryhmä 1', ownerId: 'user1', members: ['user1', 'user2'] },
    { id: 'group2', name: 'Vasausryhmä 2', ownerId: 'user2', members: ['user1', 'user2', 'user3'] },
  ]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newVasaNumber, setNewVasaNumber] = useState('');
  const [newEmoNumber, setNewEmoNumber] = useState('');

  // Login handler
  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      setLoggedIn(true);
      setActiveGroup(groups[0]); // Set first group as active
    } else {
      Alert.alert('Virhe', 'Täytä käyttäjänimi ja salasana');
    }
  };

  // Add new entry handler
  const handleAddEntry = () => {
    if (!newVasaNumber.trim() || !newEmoNumber.trim()) {
      Alert.alert('Virhe', 'Täytä kaikki kentät');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      vasaNumber: newVasaNumber,
      emoNumber: newEmoNumber,
      creatorName: username || 'Demo User',
      createdAt: new Date().toISOString(),
      groupId: activeGroup?.id || 'group1',
      synced: false,
    };

    setEntries([...entries, newEntry]);
    setNewVasaNumber('');
    setNewEmoNumber('');
    setShowNewEntryForm(false);
    
    // Simulate syncing with a delay
    setTimeout(() => {
      setEntries(currentEntries => 
        currentEntries.map(entry => 
          entry.id === newEntry.id ? {...entry, synced: true} : entry
        )
      );
    }, 2000);

    Alert.alert('Onnistui', 'Uusi merkintä lisätty!');
  };

  // Render the login screen
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
        <Text style={styles.headerTitle}>Vasa Merkinnät</Text>
        <TouchableOpacity style={styles.syncButton} onPress={() => Alert.alert('Synkronoitu', 'Merkinnät synkronoitu isännän kanssa.')}>
          <Text style={styles.syncButtonText}>Synkronoi</Text>
        </TouchableOpacity>
      </View>
      
      {showNewEntryForm ? (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Lisää uusi merkintä</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vasan numero</Text>
            <TextInput
              style={styles.input}
              value={newVasaNumber}
              onChangeText={setNewVasaNumber}
              placeholder="Syötä vasan numero"
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emon numero</Text>
            <TextInput
              style={styles.input}
              value={newEmoNumber}
              onChangeText={setNewEmoNumber}
              placeholder="Syötä emon numero"
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setShowNewEntryForm(false)}
            >
              <Text style={styles.cancelButtonText}>Peruuta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleAddEntry}
            >
              <Text style={styles.saveButtonText}>Tallenna</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.entriesList}>
          {entries.filter(entry => entry.groupId === activeGroup?.id).map(entry => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryTitle}>Vasa: {entry.vasaNumber}</Text>
                <Text style={styles.entrySubtitle}>Emo: {entry.emoNumber}</Text>
                <Text style={styles.entryCreator}>Merkitsijä: {entry.creatorName}</Text>
                <Text style={styles.entryDate}>
                  {new Date(entry.createdAt).toLocaleDateString('fi-FI')}
                </Text>
              </View>
              <View style={styles.syncStatus}>
                <View style={[styles.syncIndicator, entry.synced ? styles.syncedIndicator : styles.unsyncedIndicator]} />
                <Text style={styles.syncText}>{entry.synced ? 'Synkronoitu' : 'Odottaa'}</Text>
              </View>
            </View>
          ))}
          
          {entries.filter(entry => entry.groupId === activeGroup?.id).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ei merkintöjä tässä ryhmässä</Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {!showNewEntryForm && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowNewEntryForm(true)}>
          <Text style={styles.addButtonText}>+ Lisää merkintä</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render groups screen
  const renderGroupsScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vasausryhmät</Text>
        <TouchableOpacity style={styles.syncButton} onPress={() => Alert.alert('Toiminto', 'Uuden ryhmän luominen')}>
          <Text style={styles.syncButtonText}>Uusi ryhmä</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.entriesList}>
        {groups.map(group => (
          <TouchableOpacity 
            key={group.id} 
            style={[
              styles.groupCard, 
              activeGroup?.id === group.id && styles.activeGroupCard
            ]}
            onPress={() => setActiveGroup(group)}
          >
            <View style={styles.groupInfo}>
              <Text style={styles.groupTitle}>{group.name}</Text>
              <Text style={styles.groupSubtitle}>
                {group.members.length} jäsentä
              </Text>
            </View>
            
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
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{username || 'Demo User'}</Text>
          <Text style={styles.profileSubtitle}>Poromies</Text>
        </View>
        
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groups.length}</Text>
            <Text style={styles.statLabel}>Ryhmät</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entries.filter(e => e.creatorName === (username || 'Demo User')).length}</Text>
            <Text style={styles.statLabel}>Merkinnät</Text>
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.infoLabel}>Sijainti</Text>
          <Text style={styles.infoValue}>Pohjois-Lappi</Text>
          
          <Text style={styles.infoLabel}>Liittynyt</Text>
          <Text style={styles.infoValue}>{new Date().toLocaleDateString('fi-FI')}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            setLoggedIn(false);
            setUsername('');
            setPassword('');
          }}
        >
          <Text style={styles.logoutButtonText}>Kirjaudu ulos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render active screen based on tab
  const renderActiveScreen = () => {
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

  // Main render
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#377E47" barStyle="light-content" />
      
      {loggedIn ? (
        <View style={styles.mainContainer}>
          {renderActiveScreen()}
          
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'entries' && styles.activeTabItem]} 
              onPress={() => setActiveTab('entries')}
            >
              <Text style={[styles.tabText, activeTab === 'entries' && styles.activeTabText]}>
                Merkinnät
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'groups' && styles.activeTabItem]} 
              onPress={() => setActiveTab('groups')}
            >
              <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
                Ryhmät
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === 'profile' && styles.activeTabItem]} 
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
                Profiili
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        renderLoginScreen()
      )}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
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
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  mainContainer: {
    flex: 1,
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
  entriesList: {
    flex: 1,
    padding: 10,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  entryCreator: {
    fontSize: 14,
    color: '#666',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  syncStatus: {
    alignItems: 'center',
    justifyContent: 'center',
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
  addButton: {
    backgroundColor: '#377E47',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#377E47',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333',
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
  activeTabText: {
    color: '#377E47',
    fontWeight: 'bold',
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeGroupCard: {
    borderWidth: 2,
    borderColor: '#377E47',
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  ownerBadge: {
    backgroundColor: '#377E47',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  ownerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#377E47',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  profileInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});

export default ExpoSnackApp;