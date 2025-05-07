# Vasa Merkintä - Expo Snack Compatible Version

This is a modified version of the Vasa Merkintä app that's compatible with Expo Snack. It mocks the native dependencies like Bluetooth and Location services so it can run in the Expo environment without errors.

## How to Use in Expo Snack

1. Go to [Expo Snack](https://snack.expo.dev/) in your browser
2. Create a new Snack
3. Copy the entire content of `ExpoSnackCompatible.js` and paste it into the main App.js file in Snack
4. Click "Run" to see the app in action

## Features Included

- Login screen with username/password validation
- Entry list with mock synchronization status
- Group selection and management
- Profile screen with mock user data
- Add new entry functionality

## Mock Services

This version includes mock implementations of:

- BluetoothService
- LocationService 
- SyncService

These mocks simulate the behavior of the real services without requiring actual native hardware access.

## Testing Instructions

1. Use any username and password to log in
2. Navigate between screens using the bottom tabs
3. Try adding a new entry
4. Select different groups
5. Test the logout functionality

All functionality is simulated and will work in the Expo Snack environment without errors.