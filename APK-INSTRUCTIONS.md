# Creating a Working Demo APK for Vasa Merkintä App

Since direct APK downloads are having issues, here's a reliable method to create a test APK:

## Option 1: Use APK builder online service

1. Go to https://appsgeyser.com/ (no sign-up required)
2. Click "Create Now" or "Create App" 
3. Select "Web App" or "Website to App Converter"
4. Enter a URL (e.g., https://expo.dev/@snack/example)
5. Add app name: "Vasa Merkintä Demo"
6. Complete the setup wizard
7. Download the generated APK
8. Drag and drop the APK to your Android emulator

## Option 2: Use the official sample APK from Android

1. Go to the Android SDK samples page: https://developer.android.com/samples
2. Download any sample app APK
3. Drag and drop to your emulator to verify APK installation works 

## Option 3: Create an APK via Expo

1. Go to https://snack.expo.dev/
2. Create a simple app with this code:

```jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  
  const handleLogin = () => {
    if (username && password) {
      setLoggedIn(true);
    } else {
      alert('Please enter username and password');
    }
  };
  
  if (loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Vasa Merkintä App</Text>
        <Text style={styles.welcome}>Welcome, {username}!</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vasa: 123</Text>
          <Text>Emo: 456</Text>
          <Text>Status: Synced</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vasa: 789</Text>
          <Text>Emo: 101</Text>
          <Text>Status: Pending</Text>
        </View>
        <Button title="Log Out" onPress={() => setLoggedIn(false)} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vasa Merkintä App</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#377E47',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
```

3. Click on "Export" or "Build" (depending on the interface)
4. Select "Build APK" option
5. Download the APK file
6. Drag and drop to your emulator

## Troubleshooting Android Emulator

If you're having issues installing any APKs in the emulator:

1. Make sure your emulator is running a supported version of Android (8.0+)
2. Try restarting the emulator with a clean state
3. Use the emulator's built-in APK installer:
   - Right-click on the emulator window
   - Select "Install APK"
   - Browse to the APK file

## Minimum Requirements for APK Installation

- Android version: 6.0 or higher
- RAM: At least 2GB for emulator
- CPU: x86 or ARM architecture supported by emulator
- Emulator must have Google Play Services if the app requires them