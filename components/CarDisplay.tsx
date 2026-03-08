import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RootComponentInitialProps } from '@iternio/react-native-auto-play';
import CompassDisc from './CompassDisc';
import WeatherSummary from './WeatherSummary';
import { carPlayService } from '../services/CarPlayService';

const CarDisplay: React.FC<RootComponentInitialProps> = (props) => {
  const [telemetry, setTelemetry] = useState(carPlayService.getTelemetry());
  const [colorScheme, setColorScheme] = useState(props.colorScheme);

  useEffect(() => {
    const unsubscribe = carPlayService.subscribe((data) => {
      setTelemetry(data);
    });
    return unsubscribe;
  }, []);

  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <View style={styles.compassContainer}>
        <CompassDisc 
          heading={telemetry.heading} 
          isDarkMode={isDarkMode} 
          width={props.window?.width ? props.window.width / 2 : undefined}
          height={props.window?.height}
        />
      </View>
      <View style={styles.weatherContainer}>
        <WeatherSummary latitude={telemetry.latitude} longitude={telemetry.longitude} isDarkMode={isDarkMode} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  compassContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherContainer: {
    flex: 1,
    maxWidth: 400,
    justifyContent: 'center',
  }
});

export default CarDisplay;
