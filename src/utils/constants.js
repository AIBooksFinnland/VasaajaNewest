/**
 * Application constants
 */

// Bluetooth settings
export const BLUETOOTH = {
    SERVICE_UUID: '00001234-0000-1000-8000-00805f9b34fb',
    CHARACTERISTIC_UUID: '00001235-0000-1000-8000-00805f9b34fb',
    SCAN_TIMEOUT: 30000, // 30 seconds
    CONNECTION_TIMEOUT: 10000, // 10 seconds
    PING_INTERVAL: 60000, // 1 minute
  };

  // Location settings
  export const LOCATION = {
    PROXIMITY_THRESHOLD: 100, // meters
    HIGH_ACCURACY: true,
    TIMEOUT: 15000, // 15 seconds
    MAXIMUM_AGE: 10000, // 10 seconds
    DISTANCE_FILTER: 10, // meters
    WATCH_INTERVAL: 5000, // 5 seconds
    FASTEST_INTERVAL: 2000, // 2 seconds
  };

  // Storage keys
  export const STORAGE_KEYS = {
    USER: 'user',
    USERS: 'users',
    GROUPS: 'groups',
    USER_GROUPS_PREFIX: 'userGroups_',
    ENTRIES_PREFIX: 'entries_',
    GROUP_ENTRIES_PREFIX: 'groupEntries_',
    APP_SETTINGS: 'appSettings',
  };

  // App settings defaults
  export const DEFAULT_SETTINGS = {
    bluetoothEnabled: true,
    locationEnabled: true,
    syncInterval: 60, // seconds
    keepOfflineData: 30, // days
    theme: 'light',
    language: 'fi',
    proximityAlert: true,
    autoSync: true,
  };

  // Message types for Bluetooth communication
  export const MESSAGE_TYPES = {
    PING: 'PING',
    PONG: 'PONG',
    ENTRY: 'ENTRY',
    ENTRY_ACK: 'ENTRY_ACK',
    SYNC_REQUEST: 'SYNC_REQUEST',
    GROUP_INFO: 'GROUP_INFO',
    USER_INFO: 'USER_INFO',
    ERROR: 'ERROR',
  };

  // UI theme colors
  export const COLORS = {
    PRIMARY: '#377E47', // Main green
    SECONDARY: '#5bc0de', // Blue
    SUCCESS: '#4CAF50', // Green
    DANGER: '#d9534f', // Red
    WARNING: '#FFC107', // Yellow
    INFO: '#5bc0de', // Light blue
    LIGHT: '#f9f9f9', // Light gray
    DARK: '#333333', // Dark gray
    WHITE: '#ffffff',
    BLACK: '#000000',
    GRAY_LIGHT: '#f2f2f2',
    GRAY: '#cccccc',
    GRAY_DARK: '#666666',
    TRANSPARENT: 'transparent',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    DISABLED: '#a5c7ad', // Light green for disabled state
  };

  // Font sizes
  export const FONT_SIZES = {
    TINY: 10,
    SMALL: 12,
    MEDIUM: 14,
    REGULAR: 16,
    LARGE: 18,
    XLARGE: 20,
    XXLARGE: 24,
    HUGE: 28,
    TITLE: 32,
  };

  // Animation durations
  export const ANIMATION = {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  };

  // Error messages
  export const ERROR_MESSAGES = {
    BLUETOOTH_INIT_FAILED: 'Bluetooth-alustus epäonnistui',
    LOCATION_INIT_FAILED: 'Sijaintipalvelun alustus epäonnistui',
    BLUETOOTH_PERMISSION_DENIED: 'Bluetooth-oikeuksia ei myönnetty',
    LOCATION_PERMISSION_DENIED: 'Sijaintioikeuksia ei myönnetty',
    GROUP_NOT_FOUND: 'Ryhmää ei löytynyt',
    USER_NOT_FOUND: 'Käyttäjää ei löytynyt',
    INVALID_CREDENTIALS: 'Virheellinen käyttäjänimi tai salasana',
    USERNAME_TAKEN: 'Käyttäjänimi on jo käytössä',
    LOGIN_REQUIRED: 'Kirjaudu sisään jatkaaksesi',
    SYNC_FAILED: 'Synkronointi epäonnistui',
    CONNECTION_FAILED: 'Yhteyden muodostaminen epäonnistui',
    NETWORK_ERROR: 'Verkkovirhe',
    UNKNOWN_ERROR: 'Tuntematon virhe',
    ENTRY_VALIDATION_FAILED: 'Merkinnän tiedot ovat puutteelliset',
    NOT_GROUP_OWNER: 'Vain ryhmän omistaja voi suorittaa tämän toiminnon',
    ALREADY_MEMBER: 'Olet jo tämän ryhmän jäsen',
    REQUEST_ALREADY_SENT: 'Liittymispyyntösi on jo lähetetty',
    MISSING_LOCATION: 'Sijaintitietoja ei ole saatavilla',
    DEVICE_NOT_FOUND: 'Laitetta ei löydy',
    NO_DEVICE_CONNECTED: 'Ei yhdistettyä laitetta',
  };

  // Success messages
  export const SUCCESS_MESSAGES = {
    ENTRY_ADDED: 'Merkintä lisätty',
    GROUP_CREATED: 'Ryhmä luotu',
    JOIN_REQUEST_SENT: 'Liittymispyyntö lähetetty',
    USER_ACCEPTED: 'Käyttäjä hyväksytty ryhmään',
    PROFILE_UPDATED: 'Profiili päivitetty',
    SYNC_COMPLETE: 'Synkronointi valmis',
    LOCATION_UPDATED: 'Sijainti päivitetty',
    CONNECTED: 'Yhdistetty',
    DISCONNECTED: 'Yhteys katkaistu',
  };

  // App version and build information
  export const APP_INFO = {
    VERSION: '1.0.0',
    BUILD: '1',
    COPYRIGHT: '© 2025 Porovasat. Kaikki oikeudet pidätetään.',
    DEVELOPER: 'Porovasat',
  };

  // Input validation regex patterns
  export const VALIDATION = {
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PASSWORD: /^.{6,}$/,
    VASA_NUMBER: /^[a-zA-Z0-9-]{1,20}$/,
    EMO_NUMBER: /^[a-zA-Z0-9-]{1,20}$/,
  };

  // Application routes
  export const ROUTES = {
    AUTH: 'Auth',
    MAIN: 'Main',
    CREATE_GROUP: 'CreateGroup',
    JOIN_GROUP: 'JoinGroup',
    ENTRIES: 'Merkinnät',
    GROUPS: 'Ryhmät',
    PROFILE: 'Profiili',
  };

  // Export all constants as a unified object for convenient imports
  export default {
    BLUETOOTH,
    LOCATION,
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    MESSAGE_TYPES,
    COLORS,
    FONT_SIZES,
    ANIMATION,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    APP_INFO,
    VALIDATION,
    ROUTES,
  };
