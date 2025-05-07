import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { AuthContext } from './AuthContext';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's groups - wrapped in useCallback to avoid recreation on every render
  const loadUserGroups = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      // Load all groups
      const groupsJson = await AsyncStorage.getItem('groups');
      const allGroups = groupsJson ? JSON.parse(groupsJson) : [];
      setGroups(allGroups);

      // Load user-group mappings
      const userGroupsJson = await AsyncStorage.getItem(`userGroups_${user.id}`);
      const loadedUserGroups = userGroupsJson ? JSON.parse(userGroupsJson) : [];

      setUserGroups(loadedUserGroups);

      // Set active group if there's one
      if (loadedUserGroups.length > 0 && !activeGroup) {
        const defaultGroup = allGroups.find(g => g.id === loadedUserGroups[0]);
        setActiveGroup(defaultGroup);
      }
    } catch (e) {
      setError('Ryhmien lataaminen epäonnistui');
    } finally {
      setLoading(false);
    }
  }, [user, activeGroup]); // Dependencies: user and activeGroup

  // Load entries for current user - wrapped in useCallback to avoid recreation on every render
  const loadEntries = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const entriesJson = await AsyncStorage.getItem(`entries_${user.id}`);
      if (entriesJson) {
        setEntries(JSON.parse(entriesJson));
      }
    } catch (e) {
      setError('Merkintöjen lataaminen epäonnistui');
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency: user

  // Load groups and entries when user changes
  useEffect(() => {
    if (user) {
      loadUserGroups();
      loadEntries();
    } else {
      setUserGroups([]);
      setActiveGroup(null);
      setEntries([]);
    }
  }, [user, loadUserGroups, loadEntries]);

  // Create a new group
  const createGroup = async (groupName, location) => {
    if (!user) {
      throw new Error('Kirjaudu sisään luodaksesi ryhmän');
    }

    try {
      setLoading(true);
      setError(null);

      // Create new group object
      const newGroup = {
        id: uuid.v4(),
        name: groupName,
        ownerId: user.id,
        ownerName: user.username,
        createdAt: new Date().toISOString(),
        location: location, // Save GPS location
        members: [], // Initially empty besides owner
        pendingMembers: [],
        active: true,
      };

      // Update groups in storage
      const groupsJson = await AsyncStorage.getItem('groups');
      const allGroups = groupsJson ? JSON.parse(groupsJson) : [];
      allGroups.push(newGroup);
      await AsyncStorage.setItem('groups', JSON.stringify(allGroups));

      // Update user's groups
      const userGroupsJson = await AsyncStorage.getItem(`userGroups_${user.id}`);
      const currentUserGroups = userGroupsJson ? JSON.parse(userGroupsJson) : [];
      currentUserGroups.push(newGroup.id);
      await AsyncStorage.setItem(`userGroups_${user.id}`, JSON.stringify(currentUserGroups));

      // Update state
      setGroups(allGroups);
      setUserGroups(currentUserGroups);
      setActiveGroup(newGroup);

      return newGroup;
    } catch (e) {
      setError('Ryhmän luominen epäonnistui');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Request to join a group
  const requestJoinGroup = async (groupId, location) => {
    if (!user) {
      throw new Error('Kirjaudu sisään liittyäksesi ryhmään');
    }

    try {
      setLoading(true);
      setError(null);

      // Get all groups
      const groupsJson = await AsyncStorage.getItem('groups');
      if (!groupsJson) {
        throw new Error('Ryhmää ei löytynyt');
      }

      const allGroups = JSON.parse(groupsJson);
      const groupToJoin = allGroups.find(g => g.id === groupId);

      if (!groupToJoin) {
        throw new Error('Ryhmää ei löytynyt');
      }

      // Check if already a member or pending
      if (groupToJoin.members.includes(user.id)) {
        throw new Error('Olet jo tämän ryhmän jäsen');
      }

      if (groupToJoin.pendingMembers.some(p => p.userId === user.id)) {
        throw new Error('Liittymispyyntösi on jo lähetetty');
      }

      // Check location proximity (in a real app, this would use GPS distance calculation)
      // Simplified example:
      const pendingRequest = {
        userId: user.id,
        username: user.username,
        requestedAt: new Date().toISOString(),
        location: location,
      };

      // Add to pending members
      groupToJoin.pendingMembers.push(pendingRequest);

      // Update in storage
      const updatedGroups = allGroups.map(g =>
        g.id === groupId ? groupToJoin : g,
      );

      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);

      return groupToJoin;
    } catch (e) {
      setError(e.message || 'Ryhmään liittyminen epäonnistui');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Accept a join request (for group owners)
  const acceptJoinRequest = async (groupId, userId) => {
    if (!user) {
      throw new Error('Kirjaudu sisään');
    }

    try {
      setLoading(true);
      setError(null);

      // Get all groups
      const groupsJson = await AsyncStorage.getItem('groups');
      if (!groupsJson) {
        throw new Error('Ryhmää ei löytynyt');
      }

      const allGroups = JSON.parse(groupsJson);
      const group = allGroups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Ryhmää ei löytynyt');
      }

      // Check if user is owner
      if (group.ownerId !== user.id) {
        throw new Error('Vain ryhmän omistaja voi hyväksyä pyyntöjä');
      }

      // Find and remove from pending, add to members
      const pendingIndex = group.pendingMembers.findIndex(p => p.userId === userId);

      if (pendingIndex === -1) {
        throw new Error('Pyyntöä ei löytynyt');
      }

      // Move from pending to members
      const pendingMember = group.pendingMembers[pendingIndex];
      group.pendingMembers.splice(pendingIndex, 1);
      group.members.push(pendingMember.userId);

      // Update in storage
      const updatedGroups = allGroups.map(g =>
        g.id === groupId ? group : g,
      );

      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));

      // Add group to the new member's groups
      const memberGroupsJson = await AsyncStorage.getItem(`userGroups_${userId}`);
      const memberGroups = memberGroupsJson ? JSON.parse(memberGroupsJson) : [];
      memberGroups.push(groupId);
      await AsyncStorage.setItem(`userGroups_${userId}`, JSON.stringify(memberGroups));

      // Update state
      setGroups(updatedGroups);

      return group;
    } catch (e) {
      setError(e.message || 'Pyynnön hyväksyminen epäonnistui');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Add a new entry
  const addEntry = async (entryData, groupId) => {
    if (!user) {
      throw new Error('Kirjaudu sisään lisätäksesi merkinnän');
    }

    try {
      setLoading(true);
      setError(null);

      // Create new entry
      const newEntry = {
        id: uuid.v4(),
        ...entryData,
        createdBy: user.id,
        creatorName: user.username,
        groupId: groupId || (activeGroup ? activeGroup.id : null),
        createdAt: new Date().toISOString(),
        synced: false, // Initially not synced with host
      };

      if (!newEntry.groupId) {
        throw new Error('Valitse ryhmä merkinnälle');
      }

      // Update entries in storage
      const entriesJson = await AsyncStorage.getItem(`entries_${user.id}`);
      const userEntries = entriesJson ? JSON.parse(entriesJson) : [];
      userEntries.push(newEntry);
      await AsyncStorage.setItem(`entries_${user.id}`, JSON.stringify(userEntries));

      // Update group entries if user is owner
      const groupsJson = await AsyncStorage.getItem('groups');
      const allGroups = JSON.parse(groupsJson);
      const group = allGroups.find(g => g.id === newEntry.groupId);

      if (group && group.ownerId === user.id) {
        // If user is host, mark as synced immediately
        newEntry.synced = true;

        // Update group's entries
        const groupEntriesJson = await AsyncStorage.getItem(`groupEntries_${group.id}`);
        const groupEntries = groupEntriesJson ? JSON.parse(groupEntriesJson) : [];
        groupEntries.push(newEntry);
        await AsyncStorage.setItem(`groupEntries_${group.id}`, JSON.stringify(groupEntries));
      }

      // Update state
      setEntries([...userEntries]);

      return newEntry;
    } catch (e) {
      setError(e.message || 'Merkinnän lisääminen epäonnistui');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Sync entries with host (would use Bluetooth in real implementation)
  const syncEntries = async (groupId) => {
    if (!user) {
      throw new Error('Kirjaudu sisään');
    }

    try {
      setLoading(true);
      setError(null);

      // In a real app, this would use Bluetooth to sync with the host
      // This is a simplified simulation:

      // Get user's entries for this group
      const entriesJson = await AsyncStorage.getItem(`entries_${user.id}`);
      if (!entriesJson) {
        return;
      }

      const userEntries = JSON.parse(entriesJson);
      const groupEntries = userEntries.filter(e => e.groupId === groupId && !e.synced);

      if (groupEntries.length === 0) {
        return;
      }

      // Simulate successful sync - mark entries as synced
      const updatedEntries = userEntries.map(entry =>
        entry.groupId === groupId && !entry.synced
          ? { ...entry, synced: true }
          : entry,
      );

      // Save updated entries
      await AsyncStorage.setItem(`entries_${user.id}`, JSON.stringify(updatedEntries));

      // Update state
      setEntries(updatedEntries);

      return updatedEntries.filter(e => e.groupId === groupId);
    } catch (e) {
      setError('Synkronointi epäonnistui');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Set current active group
  const selectActiveGroup = (group) => {
    setActiveGroup(group);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        userGroups,
        activeGroup,
        entries,
        loading,
        error,
        createGroup,
        requestJoinGroup,
        acceptJoinRequest,
        addEntry,
        syncEntries,
        selectActiveGroup,
        loadUserGroups,
        loadEntries,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
