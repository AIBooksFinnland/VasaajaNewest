import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONT_SIZES } from '../utils/constants';

/**
 * Reusable header component for screens
 *
 * @param {Object} props
 * @param {string} props.title - Header title
 * @param {boolean} props.showBack - Whether to show back button
 * @param {function} props.onBackPress - Function to call when back button is pressed
 * @param {Array} props.rightButtons - Array of button objects for the right side
 * @param {Object} props.style - Additional style for the header container
 * @param {boolean} props.transparent - Whether the header should be transparent
 */
const Header = ({
  title,
  showBack = false,
  onBackPress,
  rightButtons = [],
  style,
  transparent = false,
}) => {
  // Render back button if needed
  const renderBackButton = () => {
    if (!showBack) {return null;}

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon
          name="arrow-left"
          size={24}
          color={transparent ? COLORS.WHITE : COLORS.DARK}
        />
      </TouchableOpacity>
    );
  };

  // Render right side buttons
  const renderRightButtons = () => {
    if (!rightButtons || rightButtons.length === 0) {return null;}

    return (
      <View style={styles.rightButtonsContainer}>
        {rightButtons.map((button, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.rightButton, index > 0 && styles.rightButtonMargin]}
            onPress={button.onPress}
            disabled={button.disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {button.icon ? (
              <Icon
                name={button.icon}
                size={button.iconSize || 24}
                color={
                  button.disabled
                    ? COLORS.GRAY
                    : transparent
                    ? COLORS.WHITE
                    : button.color || COLORS.PRIMARY
                }
              />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      button.disabled
                        ? COLORS.GRAY
                        : transparent
                        ? COLORS.WHITE
                        : button.color || COLORS.PRIMARY,
                  },
                ]}
              >
                {button.title}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparentContainer,
        style,
      ]}
    >
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : COLORS.WHITE}
        translucent={transparent}
      />

      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {renderBackButton()}
          {!showBack && <View style={styles.spacer} />}
        </View>

        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              transparent && styles.transparentTitle,
              showBack && styles.titleWithBack,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {renderRightButtons()}
          {(!rightButtons || rightButtons.length === 0) && (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY,
    zIndex: 10,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.DARK,
    textAlign: 'center',
  },
  transparentTitle: {
    color: COLORS.WHITE,
  },
  titleWithBack: {
    marginLeft: -40, // Adjust for the back button
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButton: {
    padding: 8,
  },
  rightButtonMargin: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
  },
  spacer: {
    width: 40,
  },
});

export default Header;