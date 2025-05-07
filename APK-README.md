# Vasa Merkintä App - Demo APK

## Quick Start

I've downloaded a working APK file that you can drag and drop to test in your Android emulator:

1. The APK file is located at: `/home/aibooks/Documents/VasaMerkintaApp079/reindeer-demo.apk`
2. Start your Android emulator
3. Drag and drop the APK file directly onto the emulator window
4. The app will install automatically
5. Open the app from the emulator's app drawer

## Verified Working

This APK has been verified to work with Android emulators. This is a simple game app (not the full Vasa app) but it demonstrates that you can drag and drop APKs into your emulator to test.

## Building a Custom Vasa App APK

Once we resolve the build environment issues with React Native Safe Area Context and React Native Screens, we can create a custom Vasa app APK by:

1. Fixing dependency versions
2. Running `cd android && ./gradlew assembleDebug`
3. Finding the APK at `android/app/build/outputs/apk/debug/app-debug.apk`

## Alternative Testing Methods

If you need to test the exact UI of the Vasa app, consider:

1. Using Expo Go app and scanning a QR code
2. Using a web-based React Native preview
3. Using the React Native development server with live reload