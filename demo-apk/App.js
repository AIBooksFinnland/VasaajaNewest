import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';

// Simple demo app for Vasa Merkintä App
export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState('entries');
  
  // Sample data
  const [entries] = useState([
    { id: '1', vasaNumber: '123', emoNumber: '456', creatorName: 'Demo User', createdAt: new Date().toISOString(), synced: true },
    { id: '2', vasaNumber: '789', emoNumber: '012', creatorName: 'Demo User', createdAt: new Date().toISOString(), synced: false },
  ]);
  
  const [groups] = useState([
    { id: '1', name: 'Ryhmä 1', memberCount: 3, isOwner: true },
    { id: '2', name: 'Ryhmä 2', memberCount: 5, isOwner: false },
  ]);
  
  // Login handler
  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      Alert.alert('Virhe', 'Täytä käyttäjänimi ja salasana');
    }
  };
  
  // Add entry handler
  const handleAddEntry = () => {
    Alert.alert('Uusi merkintä', 'Merkintä lisätty onnistuneesti!');
  };
  
  // Render login screen
  const renderLoginScreen = () => (
    <View style={styles.container}>
      <StatusBar backgroundColor="#377E47" barStyle="light-content" />
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
  
  // Render entries list screen
  const renderEntriesScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vasa Merkinnät</Text>
        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncButtonText}>Synkronoi</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {entries.map(entry => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryInfo}>
              <Text style={styles.entryTitle}>Vasa: {entry.vasaNumber}</Text>
              <Text style={styles.entrySubtitle}>Emo: {entry.emoNumber}</Text>
              <Text style={styles.entryCreator}>Merkitsijä: {entry.creatorName}</Text>
              <Text style={styles.entryDate}>{new Date(entry.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.syncStatus}>
              <View style={[styles.syncIndicator, entry.synced ? styles.syncedIndicator : styles.unsyncedIndicator]} />
              <Text style={styles.syncText}>{entry.synced ? 'Synkronoitu' : 'Odottaa'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Text style={styles.addButtonText}>+ Lisää merkintä</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render groups screen
  const renderGroupsScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vasausryhmät</Text>
        <TouchableOpacity style={styles.syncButton}>
          <Text style={styles.syncButtonText}>Uusi ryhmä</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        {groups.map(group => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupTitle}>{group.name}</Text>
              <Text style={styles.groupSubtitle}>{group.memberCount} jäsentä</Text>
            </View>
            {group.isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Isäntä</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
  
  // Render profile screen
  const renderProfileScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Käyttäjäprofiili</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{username || 'Käyttäjä'}</Text>
          <Text style={styles.profileInfo}>Sijainti: Pohjois-Lappi</Text>
          <Text style={styles.profileInfo}>Ryhmät: {groups.length}</Text>
          <Text style={styles.profileInfo}>Merkinnät: {entries.length}</Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setIsLoggedIn(false)}
          >
            <Text style={styles.logoutButtonText}>Kirjaudu ulos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Conditionally render active screen
  const renderActiveScreen = () => {
    switch (activeScreen) {
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
  
  // Main app return
  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#377E47" barStyle="light-content" />
      
      {isLoggedIn ? (
        <>
          {renderActiveScreen()}
          
          {/* Bottom Navigation Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tabItem, activeScreen === 'entries' && styles.activeTabItem]} 
              onPress={() => setActiveScreen('entries')}
            >
              <Text style={styles.tabText}>Merkinnät</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabItem, activeScreen === 'groups' && styles.activeTabItem]} 
              onPress={() => setActiveScreen('groups')}
            >
              <Text style={styles.tabText}>Ryhmät</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabItem, activeScreen === 'profile' && styles.activeTabItem]} 
              onPress={() => setActiveScreen('profile')}
            >
              <Text style={styles.tabText}>Profiili</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderLoginScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
  contentContainer: {
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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
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
});