
import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  useWindowDimensions,
  AppState
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { 
  Compass, 
  Navigation, 
  MapPin, 
  Sun, 
  Moon,
  Monitor
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import { Theme } from './types';
import { useCompass } from './hooks/useCompass';
import CompassDisc from './components/CompassDisc';
import WeatherSummary from './components/WeatherSummary';

const App: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [brightnessMode, setBrightnessMode] = useState<'system' | 'max' | 'dim'>('system');
  const { orientation, location, error, requestPermissions, permissionGranted } = useCompass();
  const [lastHapticHeading, setLastHapticHeading] = useState<number | null>(null);

  const isDarkMode = theme === Theme.DARK;
  const styles = createStyles(isDarkMode);

  useEffect(() => {
    const hideNavBar = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
      }
    };

    hideNavBar();

    const requestBrightness = async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        Brightness.useSystemBrightnessAsync();
      }
    };
    requestBrightness();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        hideNavBar();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;

    const heading = orientation.heading;
    
    // Check if heading is close to cardinal (0, 90, 180, 270) or ordinal (45, 135, 225, 315)
    // Give a 2 degree threshold
    const isCardinal = heading % 90 <= 2 || heading % 90 >= 88;
    const isOrdinal = heading % 45 <= 2 || heading % 45 >= 43;

    if (isCardinal || isOrdinal) {
      // Determine which point we are near
      let point = Math.round(heading / 45) * 45;
      if (point === 360) point = 0;

      if (lastHapticHeading !== point) {
        if (point % 90 === 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setLastHapticHeading(point);
      }
    } else {
      // Reset when we move away from the point
      if (lastHapticHeading !== null) {
        let diff = Math.abs(heading - lastHapticHeading);
        if (diff > 180) diff = 360 - diff;
        if (diff > 5) {
          setLastHapticHeading(null);
        }
      }
    }
  }, [orientation.heading, permissionGranted, lastHapticHeading]);

  const toggleBrightness = async () => {
    const { status } = await Brightness.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Brightness.requestPermissionsAsync();
      if (newStatus !== 'granted') return;
    }

    if (brightnessMode === 'system') {
      await Brightness.setBrightnessAsync(1);
      setBrightnessMode('max');
    } else if (brightnessMode === 'max') {
      await Brightness.setBrightnessAsync(0.1);
      setBrightnessMode('dim');
    } else {
      await Brightness.useSystemBrightnessAsync();
      setBrightnessMode('system');
    }
  };

  if (!permissionGranted) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.fullScreen, styles.centerContent]} edges={['top', 'left', 'right']}>
          <StatusBar hidden />
          <View style={styles.iconCircle}>
            <Compass size={64} color="#ef4444" />
          </View>
          <Text style={styles.title}>Horizon Pro</Text>
          <Text style={styles.subtitle}>Professional navigation for Expo. Please enable sensor and location access to start.</Text>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={requestPermissions}
            accessibilityLabel="Enable Sensors and Location"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Enable Sensors</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <SafeAreaView style={styles.fullScreen} edges={['top', 'left', 'right']}>
          <StatusBar hidden />
          
          <View style={styles.topBar}>
          <View style={styles.logoGroup}>
            <View style={styles.logoBox}>
              <Navigation size={14} color="white" />
            </View>
            <Text style={styles.logoText}>HORIZON</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity 
              onPress={toggleBrightness} 
              style={styles.actionButton}
              accessibilityLabel="Toggle Brightness"
              accessibilityRole="button"
            >
              <Monitor size={20} color={brightnessMode === 'system' ? '#71717a' : (brightnessMode === 'max' ? '#fbbf24' : '#60a5fa')} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTheme(t => t === Theme.DARK ? Theme.LIGHT : Theme.DARK)} 
              style={styles.actionButton}
              accessibilityLabel="Toggle Theme"
              accessibilityRole="button"
            >
              {isDarkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#4f46e5" />}
            </TouchableOpacity>
          </View>
          </View>

          <View style={[
            styles.mainContent,
            isLandscape && styles.landscapeMainContent
          ]}>
            <View style={[
              styles.compassSection,
              isLandscape && styles.landscapeCompassSection
            ]}>
              <CompassDisc heading={orientation.heading} isDarkMode={isDarkMode} />
              
              <View style={[
                styles.telemetryGrid,
                isLandscape && styles.landscapeTelemetryGrid
              ]}>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Pitch</Text>
                  <Text style={styles.telemetryValue}>{orientation.pitch}°</Text>
                </View>
                <View style={styles.telemetryItem}>
                  <Text style={styles.telemetryLabel}>Roll</Text>
                  <Text style={styles.telemetryValue}>{orientation.roll}°</Text>
                </View>
              </View>
            </View>

            <View style={[
              styles.cardContainer,
              isLandscape && styles.landscapeCardContainer
            ]}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MapPin size={18} color="#3b82f6" />
                  <Text style={styles.cardTitle}>Live Positioning</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>LATITUDE</Text>
                    <Text style={styles.statValue}>{location.latitude?.toFixed(5) || 'Searching...'}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>LONGITUDE</Text>
                    <Text style={styles.statValue}>{location.longitude?.toFixed(5) || 'Searching...'}</Text>
                  </View>
                </View>
              </View>
              <WeatherSummary 
                latitude={location.latitude} 
                longitude={location.longitude} 
                isDarkMode={isDarkMode} 
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
};

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: isDarkMode ? '#09090b' : '#ffffff',
  },
  fullScreen: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: isDarkMode ? '#09090b' : '#ffffff',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  landscapeMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontWeight: '900',
    fontSize: 22,
    color: isDarkMode ? '#fff' : '#000',
    letterSpacing: -0.5,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: isDarkMode ? '#18181b' : '#f4f4f5',
  },
  compassSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  landscapeCompassSection: {
    flex: 1.2,
    paddingVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  telemetryGrid: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    gap: 12,
  },
  landscapeTelemetryGrid: {
    flexDirection: 'column',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 15,
  },
  telemetryItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#18181b' : '#f4f4f5',
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 110,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: isDarkMode ? '#fff' : '#000',
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  landscapeCardContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDarkMode ? '#27272a' : '#f4f4f5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: isDarkMode ? '#a1a1aa' : '#52525b',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717a',
    marginBottom: 4,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: isDarkMode ? '#fff' : '#000',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: isDarkMode ? '#18181b' : '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: isDarkMode ? '#fff' : '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 28,
  },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 22,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 20,
    color: '#f87171',
    fontSize: 14,
  }
});

export default App;
