
import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Platform,
  useWindowDimensions
} from 'react-native';
import { 
  Compass, 
  Navigation, 
  Share2, 
  MapPin, 
  Sun, 
  Moon
} from 'lucide-react-native';
import { Theme } from './types';
import { useCompass } from './hooks/useCompass';
import CompassDisc from './components/CompassDisc';

const App: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const { orientation, location, error, requestPermissions, permissionGranted } = useCompass();

  const isDarkMode = theme === Theme.DARK;
  const styles = createStyles(isDarkMode);

  if (!permissionGranted) {
    return (
      <View style={[styles.fullScreen, styles.centerContent]}>
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
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.fullScreen}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <View style={styles.topBar}>
          <View style={styles.logoGroup}>
            <View style={styles.logoBox}>
              <Navigation size={14} color="white" />
            </View>
            <Text style={styles.logoText}>HORIZON</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setTheme(t => t === Theme.DARK ? Theme.LIGHT : Theme.DARK)} 
            style={styles.themeToggle}
            accessibilityLabel="Toggle Theme"
            accessibilityRole="button"
          >
            {isDarkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#4f46e5" />}
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            isLandscape && styles.landscapeScrollContent
          ]} 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={[
            styles.mainContent,
            isLandscape && styles.landscapeMainContent
          ]}>
            <View style={[
              styles.compassSection,
              isLandscape && styles.landscapeCompassSection
            ]}>
              <CompassDisc heading={orientation.heading} isDarkMode={isDarkMode} />
              
              <View style={styles.telemetryGrid}>
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
            </View>
          </View>
        </ScrollView>

        <View style={[
          styles.actionBar,
          isLandscape && styles.landscapeActionBar
        ]}>
          <TouchableOpacity style={styles.actionItem} accessibilityLabel="Location Pin"><MapPin size={24} color={isDarkMode ? '#52525b' : '#a1a1aa'} /></TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.mainAction,
              isLandscape && styles.landscapeMainAction
            ]} 
            accessibilityLabel="Compass"
            accessibilityRole="button"
          >
            <Compass size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} accessibilityLabel="Share Location"><Share2 size={24} color={isDarkMode ? '#52525b' : '#a1a1aa'} /></TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  landscapeScrollContent: {
    paddingBottom: 100,
  },
  mainContent: {
    flex: 1,
  },
  landscapeMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  themeToggle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: isDarkMode ? '#18181b' : '#f4f4f5',
  },
  compassSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  landscapeCompassSection: {
    flex: 1,
    paddingVertical: 0,
  },
  telemetryGrid: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
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
    padding: 20,
    gap: 16,
  },
  landscapeCardContainer: {
    flex: 1,
    padding: 0,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDarkMode ? '#27272a' : '#f4f4f5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  actionBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 76,
    backgroundColor: isDarkMode ? 'rgba(24, 24, 27, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#27272a' : '#f1f5f9',
  },
  landscapeActionBar: {
    bottom: 15,
    height: 60,
  },
  actionItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAction: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -15 }],
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  landscapeMainAction: {
    width: 50,
    height: 50,
    borderRadius: 18,
    transform: [{ translateY: -10 }],
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
