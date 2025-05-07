import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';
import LocationService from '../services/LocationService';
import BluetoothService from '../services/BluetoothService';

// Extracted components to avoid react/no-unstable-nested-components warning
const EmptyComponent = ({ nearbyGroups }) => (
  <View style={styles.emptyContainer}>
    <Icon name="bluetooth-off" size={64} color="#ccc" />
    <Text style={styles.emptyText}>
      {nearbyGroups.length === 0
        ? 'Ryhmiä ei ole vielä etsitty'
        : 'Ei hakua vastaavia ryhmiä'}
    </Text>
    <Text style={styles.emptySubtext}>
      {nearbyGroups.length === 0
        ? 'Aloita painamalla "Skannaa"'
        : 'Kokeile eri hakuehtoja tai päivitä sijainti'}
    </Text>
  </View>
);

const JoinGroupScreen = ({ navigation }) => {
  // We still need AuthContext for context initialization, but we don't need to extract any values
  useContext(AuthContext);

  const {
    groups,
    userGroups,
    requestJoinGroup,
    error: contextError,
  } = useContext(GroupContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [nearbyGroups, setNearbyGroups] = useState([]);

  useEffect(() => {
    // Initialize location service
    const initializeLocation = async () => {
      try {
        setFetchingLocation(true);
        await LocationService.initialize();
        const currentLocation = await LocationService.getCurrentLocation();
        setLocation(currentLocation);
      } catch (locationError) {
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
      BluetoothService.stopScan();
    };
  }, []);

  useEffect(() => {
    if (contextError) {
      Alert.alert('Virhe', contextError);
    }
  }, [contextError]);

  // Handle search for nearby groups
  const handleScanForGroups = async () => {
    try {
      if (!location) {
        Alert.alert('Virhe', 'Sijaintitietoja ei ole saatavilla');
        return;
      }

      setScanning(true);
      setNearbyGroups([]);

      // Initialize Bluetooth
      const bleInitialized = await BluetoothService.initialize();
      if (!bleInitialized) {
        throw new Error('Bluetooth-käyttöönotto epäonnistui');
      }

      // Set up callback for discovered devices
      BluetoothService.onDeviceDiscovered = (device) => {
        // In a real app, you would extract group info from advertising data
        console.log('Löydetty laite:', device.name || device.id);
      };

      // Start scanning
      await BluetoothService.startScan();

      // Simulate finding groups based on location
      // In a real app, this would be done through Bluetooth discovery
      setTimeout(() => {
        const nearbyGroupsFound = findNearbyGroups();
        setNearbyGroups(nearbyGroupsFound);
        setScanning(false);

        if (nearbyGroupsFound.length === 0) {
          Alert.alert('Ei tuloksia', 'Lähellä ei löytynyt vasausryhmiä.');
        }

        // Stop scanning
        BluetoothService.stopScan();
      }, 3000);
    } catch (scanError) {
      console.error('Scan error:', scanError);
      Alert.alert('Virhe', 'Ryhmien etsintä epäonnistui: ' + scanError.message);
      setScanning(false);
    }
  };

  // Simulate finding nearby groups based on location
  const findNearbyGroups = () => {
    if (!location) {
      return [];
    }

    // Filter groups that are not already joined
    const availableGroups = groups.filter(group =>
      !userGroups.includes(group.id) &&
      group.location &&
      LocationService.isInProximity(
        location,
        group.location,
        100, // 100 meters proximity
      ),
    );

    return availableGroups;
  };

  // Handle join group request
  const handleJoinRequest = async (groupId) => {
    try {
      if (!location) {
        Alert.alert('Virhe', 'Sijaintitietoja ei ole saatavilla');
        return;
      }

      await requestJoinGroup(groupId, location);
      Alert.alert(
        'Pyyntö lähetetty',
        'Liittymispyyntö on lähetetty ryhmän isännälle.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (joinError) {
      Alert.alert('Virhe', 'Liittymispyynnön lähettäminen epäonnistui');
    }
  };

  // Filter groups based on search term
  const filteredGroups = nearbyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Refresh location
  const refreshLocation = async () => {
    try {
      setFetchingLocation(true);
      const currentLocation = await LocationService.getCurrentLocation();
      setLocation(currentLocation);
      Alert.alert('Onnistui', 'Sijainti päivitetty');
    } catch (refreshError) {
      Alert.alert('Virhe', 'Sijainnin päivitys epäonnistui');
    } finally {
      setFetchingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liity vasausryhmään</Text>
        <Text style={styles.subtitle}>
          Etsi lähistöllä olevia ryhmiä ja lähetä liittymispyyntö.
        </Text>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.sectionTitle}>Sijaintisi</Text>

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
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshLocation}
              disabled={fetchingLocation}
            >
              <Text style={styles.refreshButtonText}>Päivitä</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.locationStatusContainer}>
            <Text style={styles.locationErrorText}>Sijaintia ei saatavilla</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshLocation}
              disabled={fetchingLocation}
            >
              <Text style={styles.refreshButtonText}>Yritä uudelleen</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Hae ryhmiä</Text>

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Ryhmän nimi"
          />
          <TouchableOpacity
            style={[styles.scanButton, (scanning || !location) && styles.disabledButton]}
            onPress={handleScanForGroups}
            disabled={scanning || !location}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="bluetooth-searching" size={20} color="#fff" />
                <Text style={styles.scanButtonText}>Skannaa</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>
          Löydetyt ryhmät {filteredGroups.length > 0 ? `(${filteredGroups.length})` : ''}
        </Text>

        {scanning ? (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color="#377E47" />
            <Text style={styles.scanningText}>Etsitään lähellä olevia ryhmiä...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredGroups}
            renderItem={({ item }) => (
              <View style={styles.groupItem}>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupOwner}>Isäntä: {item.ownerName}</Text>
                  <Text style={styles.groupMembers}>
                    Jäseniä: {item.members.length + 1}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinRequest(item.id)}
                >
                  <Text style={styles.joinButtonText}>Liity</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<EmptyComponent nearbyGroups={nearbyGroups} />}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  locationContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#377E47',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#a5c7ad',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scanningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupOwner: {
    fontSize: 14,
    color: '#666',
  },
  groupMembers: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: '#377E47',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default JoinGroupScreen;