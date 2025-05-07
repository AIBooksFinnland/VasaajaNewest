import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONT_SIZES } from '../utils/constants';

/**
 * Reusable Button component with various styling options
 * Supports icons, loading state, and different variants
 *
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {function} props.onPress - Button press handler
 * @param {string} props.variant - Button style variant (primary, secondary, success, danger, outline)
 * @param {boolean} props.loading - Whether to show loading indicator
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.iconName - Name of the icon to display (from MaterialCommunityIcons)
 * @param {string} props.iconPosition - Position of the icon (left, right)
 * @param {Object} props.style - Additional style for the button container
 * @param {Object} props.textStyle - Additional style for the button text
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  // Determine button and text colors based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: COLORS.SECONDARY,
          textColor: COLORS.WHITE,
        };
      case 'success':
        return {
          backgroundColor: COLORS.SUCCESS,
          textColor: COLORS.WHITE,
        };
      case 'danger':
        return {
          backgroundColor: COLORS.DANGER,
          textColor: COLORS.WHITE,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.TRANSPARENT,
          textColor: COLORS.PRIMARY,
          borderColor: COLORS.PRIMARY,
          borderWidth: 1,
        };
      case 'primary':
      default:
        return {
          backgroundColor: COLORS.PRIMARY,
          textColor: COLORS.WHITE,
        };
    }
  };

  const { backgroundColor, textColor, borderColor, borderWidth } = getButtonStyles();

  // Render icon if provided
  const renderIcon = () => {
    if (!iconName) {return null;}

    return (
      <Icon
        name={iconName}
        size={20}
        color={disabled ? COLORS.GRAY : textColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: disabled ? COLORS.DISABLED : backgroundColor },
        borderColor && { borderColor: disabled ? COLORS.GRAY : borderColor },
        borderWidth && { borderWidth },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {iconPosition === 'left' && renderIcon()}
          <Text
            style={[
              styles.buttonText,
              { color: disabled ? COLORS.GRAY_DARK : textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;