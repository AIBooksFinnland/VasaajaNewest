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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';
import LocationService from '../services/LocationService';

const GroupListScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const {
    groups,
    userGroups,
    loadUserGroups,
    acceptJoinRequest,
    loading,
    error: contextError,
  } = useContext(GroupContext);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);

  useEffect(() => {
    // Reload groups when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserGroups();
    });

    return unsubscribe;
  }, [navigation, loadUserGroups]);

  useEffect(() => {
    if (contextError) {
      Alert.alert('Virhe', contextError);
    }
  }, [contextError]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserGroups();
    setRefreshing(false);
  };

  // Handle group selection
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setDetailsModalVisible(true);
  };

  // Handle accept join request
  const handleAcceptRequest = async (groupId, userId) => {
    try {
      await acceptJoinRequest(groupId, userId);
      // Refresh the group data
      setDetailsModalVisible(false);
      await loadUserGroups();

      // Find the updated group
      const updatedGroup = groups.find(g => g.id === groupId);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
        setDetailsModalVisible(true);
      }

      Alert.alert('Onnistui', 'Käyttäjä hyväksytty ryhmään');
    } catch (requestErr) {
      Alert.alert('Virhe', 'Pyynnön hyväksyminen epäonnistui');
    }
  };

  // Handle location check
  const checkLocation = async (groupLocation) => {
    try {
      await LocationService.initialize();
      const currentLocation = await LocationService.getCurrentLocation();

      const isNearby = LocationService.isInProximity(
        currentLocation,
        groupLocation,
        100, // 100 meters proximity
      );

      if (isNearby) {
        Alert.alert('Sijainti', 'Olet vasausryhmän sijainnin lähellä.');
      } else {
        Alert.alert('Sijainti', 'Et ole vasausryhmän sijainnin lähellä.');
      }
    } catch (locationErr) {
      Alert.alert('Virhe', 'Sijainnin tarkistus epäonnistui');
    }
  };

  // Handle view join requests
  const handleViewRequests = (group) => {
    if (!group.pendingMembers || group.pendingMembers.length === 0) {
      Alert.alert('Ei pyyntöjä', 'Ei odottavia liittymispyyntöjä');
      return;
    }

    setRequestsModalVisible(true);
  };

  // Filter user's groups
  const userGroupsList = groups.filter(group =>
    userGroups.includes(group.id),
  );

  // Group item component
  const renderGroupItem = ({ item }) => {
    const isOwner = item.ownerId === user?.id;
    const pendingCount = item.pendingMembers ? item.pendingMembers.length : 0;

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => handleSelectGroup(item)}
      >
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Isäntä</Text>
            </View>
          )}
        </View>

        <View style={styles.groupInfo}>
          <View style={styles.infoItem}>
            <Icon name="account-multiple" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.members.length + 1} käyttäjää
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString('fi-FI')}
            </Text>
          </View>
        </View>

        {isOwner && pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#377E47" />
          <Text style={styles.loadingText}>Ladataan ryhmiä...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={userGroupsList}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-group" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Ei vasausryhmiä</Text>
                <Text style={styles.emptySubtext}>
                  Luo uusi ryhmä tai liity olemassa olevaan
                </Text>
              </View>
            }
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => navigation.navigate('JoinGroup')}
            >
              <Icon name="account-plus" size={20} color="#fff" />
              <Text style={styles.buttonText}>Liity ryhmään</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Icon name="plus" size={20} color="#fff" />
              <Text style={styles.buttonText}>Luo ryhmä</Text>
            </TouchableOpacity>
          </View>

          {/* Group Details Modal */}
          <Modal
            visible={detailsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setDetailsModalVisible(false)}
          >
            {selectedGroup && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedGroup.name}</Text>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Luotu:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedGroup.createdAt).toLocaleString('fi-FI')}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Isäntä:</Text>
                    <Text style={styles.detailValue}>{selectedGroup.ownerName}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Jäseniä:</Text>
                    <Text style={styles.detailValue}>
                      {selectedGroup.members.length + 1}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sijainti:</Text>
                    <TouchableOpacity
                      onPress={() => checkLocation(selectedGroup.location)}
                      style={styles.locationButton}
                    >
                      <Text style={styles.locationButtonText}>Tarkista läheisyys</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedGroup.ownerId === user?.id && (
                    <TouchableOpacity
                      style={styles.requestsButton}
                      onPress={() => handleViewRequests(selectedGroup)}
                    >
                      <Icon name="account-multiple-plus" size={20} color="#fff" />
                      <Text style={styles.requestsButtonText}>
                        Näytä liittymispyynnöt
                        {selectedGroup.pendingMembers && selectedGroup.pendingMembers.length > 0 ?
                          ` (${selectedGroup.pendingMembers.length})` : ''}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Sulje</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Modal>

          {/* Join Requests Modal */}
          <Modal
            visible={requestsModalVisible && selectedGroup}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setRequestsModalVisible(false)}
          >
            {selectedGroup && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Liittymispyynnöt</Text>

                  <FlatList
                    data={selectedGroup.pendingMembers}
                    keyExtractor={(item) => item.userId}
                    renderItem={({ item }) => (
                      <View style={styles.requestItem}>
                        <View style={styles.requestInfo}>
                          <Text style={styles.requestName}>{item.username}</Text>
                          <Text style={styles.requestDate}>
                            {new Date(item.requestedAt).toLocaleString('fi-FI')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAcceptRequest(selectedGroup.id, item.userId)}
                        >
                          <Text style={styles.acceptButtonText}>Hyväksy</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyRequests}>
                        <Text style={styles.emptyRequestsText}>
                          Ei odottavia liittymispyyntöjä
                        </Text>
                      </View>
                    }
                  />

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setRequestsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Sulje</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Modal>
        </>
      )}
    </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  groupItem: {
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  groupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  pendingBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#d9534f',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#5bc0de',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    backgroundColor: '#377E47',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#5bc0de',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  requestsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#377E47',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  requestsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  acceptButton: {
    backgroundColor: '#377E47',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyRequests: {
    padding: 20,
    alignItems: 'center',
  },
  emptyRequestsText: {
    fontSize: 16,
    color: '#999',
  },
});

export default GroupListScreen;