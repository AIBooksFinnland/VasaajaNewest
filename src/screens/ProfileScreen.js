import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';
import SyncService from '../services/SyncService';
import BluetoothService from '../services/BluetoothService';
import LocationService from '../services/LocationService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile, loading: authLoading } = useContext(AuthContext);
  const { entries, groups, userGroups, loading: groupsLoading } = useContext(GroupContext);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  // Check Bluetooth and Location status on load
  useEffect(() => {
    const checkServices = async () => {
      // These are simplified checks - in a real app you'd use native APIs to check actual status
      try {
        const bleInitialized = await BluetoothService.initialize();
        setBluetoothEnabled(bleInitialized);

        const locationInitialized = await LocationService.initialize();
        setLocationEnabled(locationInitialized);
      } catch (error) {
        console.error('Service check error:', error);
      }
    };

    checkServices();
  }, []);

  // Calculate user stats
  const userStats = {
    entryCount: entries.length,
    syncedEntryCount: entries.filter(e => e.synced).length,
    groupCount: userGroups.length,
    ownedGroupCount: groups.filter(g => g.ownerId === user?.id).length,
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    // Validate
    if (!newUsername.trim() && !newPassword.trim()) {
      Alert.alert('Virhe', 'Tee ainakin yksi muutos.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Virhe', 'Salasanat eivät täsmää.');
      return;
    }

    try {
      // Create updated user object
      const updatedUser = {
        ...user,
        username: newUsername.trim() || user.username,
        password: newPassword.trim() || user.password,
      };

      // Update profile
      await updateProfile(updatedUser);

      // Reset form and close modal
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setEditModalVisible(false);

      Alert.alert('Onnistui', 'Profiili päivitetty');
    } catch (error) {
      Alert.alert('Virhe', 'Profiilin päivitys epäonnistui');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clean up services before logout
      SyncService.destroy();

      // Logout user
      await logout();

      // Navigation will happen in useEffect in App.js
    } catch (error) {
      Alert.alert('Virhe', 'Uloskirjautuminen epäonnistui');
    }
  };

  // Toggle service settings
  const toggleBluetooth = async () => {
    if (!bluetoothEnabled) {
      try {
        const enabled = await BluetoothService.initialize();
        setBluetoothEnabled(enabled);
        if (!enabled) {
          Alert.alert('Virhe', 'Bluetooth-käyttöönotto epäonnistui');
        }
      } catch (error) {
        Alert.alert('Virhe', 'Bluetooth-käyttöönotto epäonnistui');
      }
    } else {
      try {
        BluetoothService.destroy();
        setBluetoothEnabled(false);
      } catch (error) {
        Alert.alert('Virhe', 'Bluetoothin sammuttaminen epäonnistui');
      }
    }
  };

  const toggleLocation = async () => {
    if (!locationEnabled) {
      try {
        const enabled = await LocationService.initialize();
        setLocationEnabled(enabled);
        if (!enabled) {
          Alert.alert('Virhe', 'Sijaintipalveluiden käyttöönotto epäonnistui');
        }
      } catch (error) {
        Alert.alert('Virhe', 'Sijaintipalveluiden käyttöönotto epäonnistui');
      }
    } else {
      try {
        LocationService.destroy();
        setLocationEnabled(false);
      } catch (error) {
        Alert.alert('Virhe', 'Sijaintipalveluiden sammuttaminen epäonnistui');
      }
    }
  };

  // Loading state
  if (authLoading || groupsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#377E47" />
        <Text style={styles.loadingText}>Ladataan profiilia...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username || 'Käyttäjä'}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.entryCount}</Text>
            <Text style={styles.statLabel}>Merkintää</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.syncedEntryCount}/{userStats.entryCount}
            </Text>
            <Text style={styles.statLabel}>Synkronoitu</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.groupCount}</Text>
            <Text style={styles.statLabel}>Ryhmää</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.ownedGroupCount}</Text>
            <Text style={styles.statLabel}>Isännöinti</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuHeader}>Profiili</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setEditModalVisible(true)}
        >
          <Icon name="account-edit" size={24} color="#377E47" style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Muokkaa profiilia</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Icon name="cog" size={24} color="#377E47" style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Asetukset</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setAboutModalVisible(true)}
        >
          <Icon name="information" size={24} color="#377E47" style={styles.menuIcon} />
          <Text style={styles.menuItemText}>Tietoja sovelluksesta</Text>
          <Icon name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Kirjaudu ulos</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Muokkaa profiilia</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Käyttäjänimi</Text>
              <TextInput
                style={styles.input}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder={user?.username || 'Käyttäjänimi'}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Uusi salasana (jätä tyhjäksi jos et halua vaihtaa)</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Uusi salasana"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Vahvista salasana</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Vahvista salasana"
                secureTextEntry
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewUsername('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setEditModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Peruuta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Tallenna</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Asetukset</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="bluetooth" size={24} color="#377E47" style={styles.settingIcon} />
                <Text style={styles.settingText}>Bluetooth</Text>
              </View>
              <Switch
                value={bluetoothEnabled}
                onValueChange={toggleBluetooth}
                trackColor={{ false: '#ccc', true: '#a5c7ad' }}
                thumbColor={bluetoothEnabled ? '#377E47' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="map-marker" size={24} color="#377E47" style={styles.settingIcon} />
                <Text style={styles.settingText}>Sijaintipalvelut</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={toggleLocation}
                trackColor={{ false: '#ccc', true: '#a5c7ad' }}
                thumbColor={locationEnabled ? '#377E47' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tietoja sovelluksesta</Text>

            <View style={styles.aboutContent}>
              <Text style={styles.appName}>Porovasat</Text>
              <Text style={styles.appVersion}>Versio 1.0.0</Text>

              <Text style={styles.aboutText}>
                Porovasat on sovellus poronhoitajille vasanmerkintöjen digitaaliseen hallintaan.
                Sovellus mahdollistaa merkintöjen tekemisen offline-tilassa ja tietojen jakamisen
                muiden käyttäjien kanssa Bluetooth-yhteyden kautta.
              </Text>

              <Text style={styles.aboutText}>
                Sovellus käyttää GPS-sijaintia varmistaakseen, että käyttäjät ovat fyysisesti
                lähellä toisiaan, mikä parantaa tietoturvaa ja varmistaa, että tiedot jaetaan
                oikeiden henkilöiden kanssa.
              </Text>

              <Text style={styles.copyright}>
                © 2025 Porovasat. Kaikki oikeudet pidätetään.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#377E47',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#377E47',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#377E47',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    margin: 20,
    marginTop: 0,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    maxHeight: '80%',
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  closeButton: {
    backgroundColor: '#377E47',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  aboutContent: {
    marginVertical: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#377E47',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ProfileScreen;