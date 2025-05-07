import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONT_SIZES } from '../utils/constants';
import { formatDate } from '../utils/helpers';

// Extracted to avoid react/no-unstable-nested-components warning
const EmptyListLoading = () => (
  <View style={styles.emptyContainer}>
    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
    <Text style={styles.loadingText}>Ladataan käyttäjiä...</Text>
  </View>
);

// Extracted to avoid react/no-unstable-nested-components warning
const EmptyListMessage = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Icon name="account-group-outline" size={64} color={COLORS.GRAY} />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

/**
 * Reusable component for displaying a list of users
 * Can be used for group members, join requests, etc.
 *
 * @param {Object} props
 * @param {Array} props.users - Array of user objects to display
 * @param {function} props.onUserPress - Function called when a user is pressed
 * @param {boolean} props.loading - Whether users are loading
 * @param {string} props.emptyMessage - Message to display when list is empty
 * @param {function} props.renderItem - Custom render function for list items
 * @param {Object} props.actionButton - Configuration for action button {title, icon, onPress}
 * @param {boolean} props.showRole - Whether to show user role
 * @param {Object} props.currentUser - Current user object to highlight current user
 */
const UserList = ({
  users = [],
  onUserPress,
  loading = false,
  emptyMessage = 'Ei käyttäjiä',
  renderItem,
  actionButton,
  showRole = false,
  currentUser = null,
}) => {
  // Default render function for user items
  const defaultRenderItem = ({ item }) => {
    const isCurrentUser = currentUser && currentUser.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.userItem, isCurrentUser && styles.currentUserItem]}
        onPress={() => onUserPress && onUserPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {(item.username || '?').charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.username || 'Tuntematon käyttäjä'}
            {isCurrentUser && ' (Sinä)'}
          </Text>

          {item.requestedAt && (
            <Text style={styles.requestDate}>
              Pyyntö: {formatDate(item.requestedAt, true)}
            </Text>
          )}

          {showRole && item.role && (
            <Text style={styles.roleText}>{item.role}</Text>
          )}
        </View>

        {actionButton && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: actionButton.color || COLORS.PRIMARY },
            ]}
            onPress={() => actionButton.onPress && actionButton.onPress(item)}
          >
            {actionButton.icon ? (
              <Icon name={actionButton.icon} size={16} color={COLORS.WHITE} />
            ) : (
              <Text style={styles.actionButtonText}>{actionButton.title}</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Empty list component
  const renderEmptyComponent = () => {
    if (loading) {
      return <EmptyListLoading />;
    }
    return <EmptyListMessage message={emptyMessage} />;
  };

  return (
    <FlatList
      data={users}
      renderItem={renderItem || defaultRenderItem}
      keyExtractor={(item) => item.id || item.userId}
      contentContainerStyle={[
        styles.listContent,
        users.length === 0 && styles.emptyList,
      ]}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    color: COLORS.DARK,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GRAY_DARK,
  },
  roleText: {
    fontSize: FONT_SIZES.SMALL,
    fontStyle: 'italic',
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '500',
    color: COLORS.WHITE,
  },
  emptyContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.GRAY_DARK,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.GRAY_DARK,
    marginTop: 16,
  },
});

export default UserList;