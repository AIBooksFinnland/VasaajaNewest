import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';
import SyncService from '../services/SyncService';

const EntryListScreen = () => {
  const { user } = useContext(AuthContext);
  const {
    entries,
    activeGroup,
    groups,
    userGroups,
    addEntry,
    syncEntries,
    selectActiveGroup,
    loading,
    error: contextError,
  } = useContext(GroupContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [vasaNumber, setVasaNumber] = useState('');
  const [emoNumber, setEmoNumber] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [groupSelectVisible, setGroupSelectVisible] = useState(false);

  useEffect(() => {
    if (contextError) {
      Alert.alert('Virhe', contextError);
    }
  }, [contextError]);

  // Initialize sync service when component mounts
  useEffect(() => {
    const initSync = async () => {
      if (user && activeGroup) {
        await SyncService.initialize(user.id);

        // Set up callbacks
        SyncService.onSyncComplete = handleSyncComplete;
        SyncService.onSyncError = handleSyncError;
        SyncService.onEntryReceived = handleEntryReceived;

        // Start hosting or join group based on user role
        if (activeGroup.ownerId === user.id) {
          await SyncService.startHosting(activeGroup.id);
        } else {
          await SyncService.joinGroup(activeGroup.id);
        }
      }
    };

    initSync();

    return () => {
      // Clean up sync service
      SyncService.stop();
    };
  }, [user, activeGroup]);

  // Handle sync completion
  const handleSyncComplete = () => {
    setSyncing(false);
    Alert.alert('Synkronointi valmis', 'Kaikki merkinnät on synkronoitu isännän kanssa.');
  };

  // Handle sync error
  const handleSyncError = (syncError) => {
    setSyncing(false);
    Alert.alert('Synkronointivirhe', syncError.message || 'Merkintöjen synkronointi epäonnistui.');
  };

  // Handle received entry (for host)
  const handleEntryReceived = (entry) => {
    Alert.alert('Uusi merkintä', `Vastaanotettu uusi merkintä käyttäjältä ${entry.creatorName || 'tuntematon'}`);
  };

  // Handle create new entry
  const handleCreateEntry = async () => {
    if (!vasaNumber.trim() || !emoNumber.trim()) {
      Alert.alert('Virhe', 'Täytä kaikki kentät');
      return;
    }

    if (!activeGroup) {
      Alert.alert('Virhe', 'Valitse ryhmä ensin');
      return;
    }

    try {
      const newEntry = await addEntry({
        vasaNumber: vasaNumber.trim(),
        emoNumber: emoNumber.trim(),
      }, activeGroup.id);

      // Try to sync the new entry
      await SyncService.sendEntry(newEntry);

      // Reset form
      setVasaNumber('');
      setEmoNumber('');
      setModalVisible(false);

      Alert.alert('Onnistui', 'Uusi merkintä lisätty');
    } catch (entryError) {
      Alert.alert('Virhe', 'Merkinnän lisääminen epäonnistui');
    }
  };

  // Handle sync button press
  const handleSync = async () => {
    if (!activeGroup) {
      Alert.alert('Virhe', 'Valitse ryhmä ensin');
      return;
    }

    try {
      setSyncing(true);
      await syncEntries(activeGroup.id);

      // Request sync via Bluetooth
      if (activeGroup.ownerId !== user.id) {
        await SyncService.syncPendingEntries();
      }
    } catch (syncError) {
      Alert.alert('Virhe', 'Synkronointi epäonnistui');
      setSyncing(false);
    }
  };

  // Handle group selection
  const handleSelectGroup = (group) => {
    selectActiveGroup(group);
    setGroupSelectVisible(false);
  };

  // Filter entries for current active group
  const filteredEntries = activeGroup
    ? entries.filter(entry => entry.groupId === activeGroup.id)
    : [];

  // Render each entry item
  const renderItem = ({ item }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryDetails}>
        <Text style={styles.entryTitle}>Vasa: {item.vasaNumber}</Text>
        <Text style={styles.entrySubtitle}>Emo: {item.emoNumber}</Text>
        <Text style={styles.entryCreator}>
          Merkitsijä: {item.creatorName || user.username}
        </Text>
        <Text style={styles.entryDate}>
          {new Date(item.createdAt).toLocaleString('fi-FI')}
        </Text>
      </View>
      <View style={styles.entryStatus}>
        {item.synced ? (
          <Icon name="check-circle" size={24} color="#4CAF50" />
        ) : (
          <Icon name="sync" size={24} color="#FFC107" />
        )}
      </View>
    </View>
  );

  // Get available groups for selection
  const availableGroups = groups.filter(g =>
    userGroups.includes(g.id),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.groupSelector}
          onPress={() => setGroupSelectVisible(true)}
        >
          <Text style={styles.groupSelectorText}>
            {activeGroup ? activeGroup.name : 'Valitse ryhmä'}
          </Text>
          <Icon name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.disabledButton]}
            onPress={handleSync}
            disabled={syncing || !activeGroup}
          >
            {syncing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Icon name="sync" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#377E47" />
          <Text style={styles.loadingText}>Ladataan merkintöjä...</Text>
        </View>
      ) : activeGroup ? (
        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Ei merkintöjä tässä ryhmässä</Text>
              <Text style={styles.emptySubtext}>
                Aloita lisäämällä uusi merkintä
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="account-group" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Ei valittua ryhmää</Text>
          <Text style={styles.emptySubtext}>
            Valitse ryhmä nähdäksesi merkinnät
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, !activeGroup && styles.disabledButton]}
        onPress={() => setModalVisible(true)}
        disabled={!activeGroup}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
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

      {/* Group Selection Modal */}
      <Modal
        visible={groupSelectVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGroupSelectVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Valitse ryhmä</Text>

            <FlatList
              data={availableGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.groupItem,
                    activeGroup && activeGroup.id === item.id && styles.activeGroupItem,
                  ]}
                  onPress={() => handleSelectGroup(item)}
                >
                  <Text style={styles.groupItemText}>{item.name}</Text>
                  {item.ownerId === user.id && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerBadgeText}>Isäntä</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>Ei ryhmiä saatavilla</Text>
                </View>
              }
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setGroupSelectVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  groupSelectorText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
  },
  syncButton: {
    backgroundColor: '#377E47',
    borderRadius: 8,
    padding: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
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
    bottom: 20,
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
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#999',
  },
});

export default EntryListScreen;