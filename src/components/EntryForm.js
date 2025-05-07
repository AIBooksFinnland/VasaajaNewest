import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import Button from './Button';
import { COLORS, FONT_SIZES } from '../utils/constants';
import { validateVasaNumber, validateEmoNumber } from '../utils/validation';

/**
 * Reusable form component for adding or editing a vasa entry
 *
 * @param {Object} props
 * @param {Object} props.initialValues - Initial form values for editing
 * @param {function} props.onSubmit - Function to call when form is submitted
 * @param {function} props.onCancel - Function to call when form is cancelled
 * @param {boolean} props.loading - Whether the form is in loading state
 * @param {string} props.submitLabel - Label for the submit button
 * @param {boolean} props.isEdit - Whether this is an edit form
 */
const EntryForm = ({
  initialValues = { vasaNumber: '', emoNumber: '' },
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Tallenna',
  isEdit = false,
}) => {
  const [vasaNumber, setVasaNumber] = useState(initialValues.vasaNumber);
  const [emoNumber, setEmoNumber] = useState(initialValues.emoNumber);
  const [errors, setErrors] = useState({
    vasaNumber: '',
    emoNumber: '',
  });

  // Update form values when initialValues changes (for editing)
  useEffect(() => {
    if (initialValues) {
      setVasaNumber(initialValues.vasaNumber || '');
      setEmoNumber(initialValues.emoNumber || '');
    }
  }, [initialValues]);

  // Validate vasa number
  const validateVasa = () => {
    const result = validateVasaNumber(vasaNumber);
    setErrors(prev => ({ ...prev, vasaNumber: result.isValid ? '' : result.message }));
    return result.isValid;
  };

  // Validate emo number
  const validateEmo = () => {
    const result = validateEmoNumber(emoNumber);
    setErrors(prev => ({ ...prev, emoNumber: result.isValid ? '' : result.message }));
    return result.isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    const vasaValid = validateVasa();
    const emoValid = validateEmo();

    if (vasaValid && emoValid) {
      onSubmit({ vasaNumber, emoNumber });
    } else {
      Alert.alert('Virheellinen syöte', 'Tarkista merkinnän tiedot.');
    }
  };

  // Clear form
  const clearForm = () => {
    setVasaNumber('');
    setEmoNumber('');
    setErrors({ vasaNumber: '', emoNumber: '' });
  };

  // Handle cancel button press
  const handleCancel = () => {
    clearForm();
    if (onCancel) {onCancel();}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Muokkaa merkintää' : 'Lisää uusi merkintä'}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vasan numero</Text>
        <TextInput
          style={[styles.input, errors.vasaNumber ? styles.inputError : null]}
          value={vasaNumber}
          onChangeText={setVasaNumber}
          placeholder="Syötä vasan numero"
          onBlur={validateVasa}
          keyboardType="default"
          autoCapitalize="none"
        />
        {errors.vasaNumber ? (
          <Text style={styles.errorText}>{errors.vasaNumber}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Emon numero</Text>
        <TextInput
          style={[styles.input, errors.emoNumber ? styles.inputError : null]}
          value={emoNumber}
          onChangeText={setEmoNumber}
          placeholder="Syötä emon numero"
          onBlur={validateEmo}
          keyboardType="default"
          autoCapitalize="none"
        />
        {errors.emoNumber ? (
          <Text style={styles.errorText}>{errors.emoNumber}</Text>
        ) : null}
      </View>

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
          disabled={!vasaNumber || !emoNumber || loading}
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
    marginBottom: 6,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default EntryForm;