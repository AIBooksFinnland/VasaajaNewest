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
    <Text style={styles.loadingText}>Ladataan merkintöjä...</Text>
  </View>
);

// Extracted to avoid react/no-unstable-nested-components warning
const EmptyListMessage = ({ message }) => (
  <View style={styles.emptyContainer}>
    <Icon name="clipboard-text-outline" size={64} color={COLORS.GRAY} />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

/**
 * Reusable component for displaying a list of vasa entries
 *
 * @param {Object} props
 * @param {Array} props.entries - Array of entry objects to display
 * @param {function} props.onEntryPress - Function called when an entry is pressed
 * @param {boolean} props.loading - Whether entries are loading
 * @param {function} props.onRefresh - Function to call when pull-to-refresh
 * @param {boolean} props.refreshing - Whether list is currently refreshing
 * @param {function} props.onEndReached - Function called when end of list is reached
 * @param {string} props.emptyMessage - Message to display when list is empty
 * @param {function} props.renderItem - Custom render function for list items
 */
const EntryList = ({
  entries = [],
  onEntryPress,
  loading = false,
  onRefresh,
  refreshing = false,
  onEndReached,
  emptyMessage = 'Ei merkintöjä',
  renderItem,
}) => {
  // Default render function for entry items
  const defaultRenderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => onEntryPress && onEntryPress(item)}
    >
      <View style={styles.entryDetails}>
        <Text style={styles.entryTitle}>Vasa: {item.vasaNumber}</Text>
        <Text style={styles.entrySubtitle}>Emo: {item.emoNumber}</Text>
        <Text style={styles.entryCreator}>
          Merkitsijä: {item.creatorName || 'Tuntematon'}
        </Text>
        <Text style={styles.entryDate}>
          {formatDate(item.createdAt, true)}
        </Text>
      </View>
      <View style={styles.entryStatus}>
        {item.synced ? (
          <Icon name="check-circle" size={24} color={COLORS.SUCCESS} />
        ) : (
          <Icon name="sync" size={24} color={COLORS.WARNING} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Empty list component
  const renderEmptyComponent = () => {
    if (loading) {
      return <EmptyListLoading />;
    }
    return <EmptyListMessage message={emptyMessage} />;
  };

  return (
    <FlatList
      data={entries}
      renderItem={renderItem || defaultRenderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        entries.length === 0 && styles.emptyList,
      ]}
      ListEmptyComponent={renderEmptyComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom for FAB
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryDetails: {
    flex: 1,
  },
  entryTitle: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  entryCreator: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GRAY_DARK,
  },
  entryDate: {
    fontSize: FONT_SIZES.TINY,
    color: COLORS.GRAY_DARK,
    marginTop: 4,
  },
  entryStatus: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: 'bold',
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

export default EntryList;