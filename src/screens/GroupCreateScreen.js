import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';
import LocationService from '../services/LocationService';
import SyncService from '../services/SyncService';

const GroupCreateScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { createGroup, loading, error: contextError } = useContext(GroupContext);
  const [groupName, setGroupName] = useState('');
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    // Initialize location service and get current location
    const initializeLocation = async () => {
      try {
        setFetchingLocation(true);
        await LocationService.initialize();
        const currentLocation = await LocationService.getCurrentLocation();
        setLocation(currentLocation);
      } catch (locationErr) {
        Alert.alert(
          'Sijaintivirhe',
          'Sijainnin määrittäminen epäonnistui. Varmista, että sijaintipalvelut ovat käytössä.',
        );
      } finally {
        setFetchingLocation(false);
      }
    };

    initializeLocation();

    return () => {
      // Clean up
      LocationService.stopWatchingLocation();
    };
  }, []);

  useEffect(() => {
    if (contextError) {
      Alert.alert('Virhe', contextError);
    }
  }, [contextError]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Virhe', 'Anna ryhmälle nimi');
      return;
    }

    if (!location) {
      Alert.alert('Virhe', 'Sijaintitietoja ei ole saatavilla');
      return;
    }

    try {
      // Create the group
      const newGroup = await createGroup(groupName, location);

      // Initialize as host for the new group
      await SyncService.initialize(user.id);
      await SyncService.startHosting(newGroup.id);

      // Navigate back to group list
      Alert.alert('Onnistui', 'Uusi vasausryhmä luotu!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (groupErr) {
      console.error('Failed to create group:', groupErr);
    }
  };

  const refreshLocation = async () => {
    try {
      setFetchingLocation(true);
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
      Alert.alert('Onnistui', 'Sijainti päivitetty');
    } catch (refreshErr) {
      Alert.alert('Virhe', 'Sijainnin päivitys epäonnistui');
    } finally {
      setFetchingLocation(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Luo uusi vasausryhmä</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ryhmän nimi</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Anna ryhmälle nimi"
          />
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.label}>Sijainti</Text>
          {fetchingLocation ? (
            <View style={styles.locationStatusContainer}>
              <ActivityIndicator size="small" color="#377E47" />
              <Text style={styles.locationText}>Haetaan sijaintia...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationStatusContainer}>
              <Text style={styles.locationText}>
                Sijainti määritetty: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
                <Text style={styles.refreshButtonText}>Päivitä</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationStatusContainer}>
              <Text style={styles.locationErrorText}>Sijaintia ei saatavilla</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
                <Text style={styles.refreshButtonText}>Yritä uudelleen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.infoText}>
          Luodessasi vasausryhmän, toimit ryhmän isäntänä. Muut käyttäjät voivat pyytää liittymistä
          ryhmääsi sijaintinsa perusteella.
        </Text>

        <TouchableOpacity
          style={[styles.createButton, (!groupName.trim() || !location || loading) && styles.disabledButton]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || !location || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Luo ryhmä</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  locationErrorText: {
    flex: 1,
    fontSize: 14,
    color: '#d9534f',
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#377E47',
    borderRadius: 6,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#377E47',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a5c7ad',
  },
});

export default GroupCreateScreen;