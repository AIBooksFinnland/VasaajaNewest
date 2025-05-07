import { AppRegistry } from 'react-native';
import ExpoSnackApp from './ExpoSnackCompatible';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => ExpoSnackApp);