import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Button from './Button';
import { COLORS, FONT_SIZES } from '../utils/constants';
import { validateGroupName } from '../utils/validation';

/**
 * Reusable form component for creating or editing a group
 *
 * @param {Object} props
 * @param {Object} props.initialValues - Initial form values for editing
 * @param {function} props.onSubmit - Function to call when form is submitted
 * @param {function} props.onCancel - Function to call when form is cancelled
 * @param {boolean} props.loading - Whether the form is in loading state
 * @param {Object} props.location - Current location data
 * @param {function} props.onRequestLocation - Function to request location update
 * @param {boolean} props.fetchingLocation - Whether location is being fetched
 * @param {string} props.submitLabel - Label for the submit button
 * @param {boolean} props.isEdit - Whether this is an edit form
 */
const GroupForm = ({
  initialValues = { name: '' },
  onSubmit,
  onCancel,
  loading = false,
  location = null,
  onRequestLocation,
  fetchingLocation = false,
  submitLabel = 'Tallenna',
  isEdit = false,
}) => {
  const [groupName, setGroupName] = useState(initialValues.name);
  const [errors, setErrors] = useState({
    name: '',
    location: '',
  });

  // Update form values when initialValues changes (for editing)
  useEffect(() => {
    if (initialValues) {
      setGroupName(initialValues.name || '');
    }
  }, [initialValues]);

  // Update location error when location changes
  useEffect(() => {
    if (location) {
      setErrors(prev => ({ ...prev, location: '' }));
    } else {
      setErrors(prev => ({ ...prev, location: 'Sijaintitietoja ei ole saatavilla' }));
    }
  }, [location]);

  // Validate group name
  const validateName = () => {
    const result = validateGroupName(groupName);
    setErrors(prev => ({ ...prev, name: result.isValid ? '' : result.message }));
    return result.isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    const nameValid = validateName();

    if (!location) {
      setErrors(prev => ({ ...prev, location: 'Sijaintitietoja ei ole saatavilla' }));
      Alert.alert('Virhe', 'Sijaintitietoja ei ole saatavilla. Päivitä sijainti ennen jatkamista.');
      return;
    }

    if (nameValid) {
      onSubmit({ name: groupName, location });
    } else {
      Alert.alert('Virheellinen syöte', 'Tarkista ryhmän tiedot.');
    }
  };

  // Clear form
  const clearForm = () => {
    setGroupName('');
    setErrors({ name: '', location: '' });
  };

  // Handle cancel button press
  const handleCancel = () => {
    clearForm();
    if (onCancel) {onCancel();}
  };

  // Handle location refresh
  const handleLocationRefresh = () => {
    if (onRequestLocation) {
      onRequestLocation();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Muokkaa ryhmää' : 'Luo uusi ryhmä'}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ryhmän nimi</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Anna ryhmälle nimi"
          onBlur={validateName}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Sijainti</Text>
        <View style={styles.locationContainer}>
          {fetchingLocation ? (
            <View style={styles.locationStatusContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.locationText}>Haetaan sijaintia...</Text>
            </View>
          ) : location ? (
            <View style={styles.locationStatusContainer}>
              <Text style={styles.locationText}>
                Sijainti määritetty: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleLocationRefresh}
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
                onPress={handleLocationRefresh}
                disabled={fetchingLocation}
              >
                <Text style={styles.refreshButtonText}>Yritä uudelleen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {errors.location ? (
          <Text style={styles.errorText}>{errors.location}</Text>
        ) : null}
      </View>

      <Text style={styles.infoText}>
        {isEdit
          ? 'Muokkaat ryhmää. Sijainnin muuttaminen voi vaikuttaa ryhmän jäseniin.'
          : 'Luodessasi vasausryhmän, toimit ryhmän isäntänä. Muut käyttäjät voivat pyytää liittymistä ryhmääsi sijaintinsa perusteella.'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Peruuta"
          onPress={handleCancel}
          variant="outline"
          style={styles.cancelButton}
          disabled={loading}
        />
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={loading}
          disabled={!groupName || !location || loading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    padding: 16,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    color: COLORS.DARK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZES.REGULAR,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  inputError: {
    borderColor: COLORS.DANGER,
  },
  errorText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.DANGER,
    marginTop: 4,
  },
  locationContainer: {
    marginBottom: 4,
  },
  locationStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  locationText: {
    flex: 1,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.DARK,
  },
  locationErrorText: {
    flex: 1,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.DANGER,
  },
  refreshButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    marginLeft: 10,
  },
  refreshButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '500',
  },
  infoText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.GRAY_DARK,
    marginBottom: 20,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default GroupForm;