# Vasa Merkintä App - Demo APK Instructions

Due to build environment constraints, here are alternative ways to create a demo APK for testing:

## Option 1: Use Snack Expo's "Build" feature

1. Go to [Expo Snack](https://snack.expo.dev/)
2. Create a new Snack
3. Copy the code from the `demo-apk/App.js` file in this repository
4. Click on "Android" in the preview panel
5. Click on "Build" in the device preview 
6. Select "Build APK" in the dropdown menu
7. This will generate an APK file you can download and drag into your emulator

## Option 2: Use React Native App Builder Online

1. Go to [BuilderX](https://builderx.io/) or any similar online React Native app builder
2. Create a new project
3. Import the basic UI components from our design
4. Use their "Export APK" feature to download a test APK file

## Option 3: Use GitHub Actions to Build APK

1. Create a GitHub workflow file (.github/workflows/build-apk.yml) with the following content:

```yaml
name: Build Debug APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up JDK 11
        uses: actions/setup-java@v1
        with:
          java-version: 11
      
      - name: Install dependencies
        run: npm install
        
      - name: Build Debug APK
        run: cd android && ./gradlew assembleDebug
        
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

2. Push this to GitHub
3. Go to the "Actions" tab in your repository
4. Run the workflow
5. Download the APK artifact

## Option 4: Use a Demo APK Template

If you're just looking to test the UI concept in an emulator, consider using a pre-built template APK that demonstrates similar functionality:

1. Download the Simple React Native Demo APK: [React Native Demo APK](https://apkpure.com/react-native-demo/com.reactnativedemo)
2. Drag and drop the APK file into your Android emulator
3. This will show a basic app structure similar to our Vasa Merkintä app design

## Instructions for Using the APK in an Emulator

1. Start your Android emulator
2. Drag and drop the APK file onto the emulator window
3. The app will be installed automatically
4. Tap on the app icon to launch it
5. Use any username/password for login (the demo doesn't validate credentials)
6. Explore the basic UI and navigation

## Building a Custom APK Later

Once the build environment issues are resolved, we can build a proper debug APK using:

```
cd android && ./gradlew assembleDebug
```

The APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`