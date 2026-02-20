
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind, Thermometer } from 'lucide-react-native';

interface WeatherSummaryProps {
  latitude: number | null;
  longitude: number | null;
  isDarkMode: boolean;
}

interface WeatherData {
  current: {
    temp: number;
    time: string;
    weatherCode: number;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }>;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({ latitude, longitude, isDarkMode }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      const formattedData: WeatherData = {
        current: {
          temp: data.current.temperature_2m,
          time: data.current.time,
          weatherCode: data.current.weather_code,
        },
        daily: data.daily.time.map((time: string, index: number) => ({
          date: time,
          maxTemp: data.daily.temperature_2m_max[index],
          minTemp: data.daily.temperature_2m_min[index],
          weatherCode: data.daily.weather_code[index],
        })),
      };
      setWeather(formattedData);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, size: number = 24) => {
    const color = isDarkMode ? '#fff' : '#000';
    if (code === 0) return <Sun size={size} color="#fbbf24" />;
    if (code <= 3) return <Cloud size={size} color={isDarkMode ? '#94a3b8' : '#64748b'} />;
    if (code <= 48) return <Cloud size={size} color={isDarkMode ? '#94a3b8' : '#64748b'} />;
    if (code <= 67) return <CloudRain size={size} color="#3b82f6" />;
    if (code <= 77) return <CloudSnow size={size} color="#93c5fd" />;
    if (code <= 82) return <CloudRain size={size} color="#3b82f6" />;
    if (code <= 99) return <CloudLightning size={size} color="#f59e0b" />;
    return <Sun size={size} color="#fbbf24" />;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading && !weather) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {/* Top Section: Current Weather & Time */}
      <View style={styles.topSection}>
        <View style={styles.tempContainer}>
          <Text style={[styles.tempText, isDarkMode ? styles.darkText : styles.lightText]}>
            {weather?.current.temp.toFixed(1)}°
          </Text>
          {weather && getWeatherIcon(weather.current.weatherCode, 48)}
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, isDarkMode ? styles.darkText : styles.lightText]}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.dateText}>
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Bottom Section: 7-Day Forecast */}
      <View style={styles.bottomSection}>
        <Text style={styles.forecastTitle}>7-DAY FORECAST</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
          {weather?.daily.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.dayName}>{index === 0 ? 'Today' : getDayName(day.date)}</Text>
              {getWeatherIcon(day.weatherCode, 20)}
              <View style={styles.forecastTemps}>
                <Text style={[styles.maxTemp, isDarkMode ? styles.darkText : styles.lightText]}>{Math.round(day.maxTemp)}°</Text>
                <Text style={styles.minTemp}>{Math.round(day.minTemp)}°</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
  },
  lightContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#f4f4f5',
  },
  darkContainer: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tempText: {
    fontSize: 48,
    fontWeight: '900',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '600',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(113, 113, 122, 0.2)',
    paddingTop: 15,
  },
  forecastTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 12,
  },
  forecastScroll: {
    gap: 20,
  },
  forecastItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 45,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717a',
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 4,
  },
  maxTemp: {
    fontSize: 13,
    fontWeight: '700',
  },
  minTemp: {
    fontSize: 13,
    color: '#71717a',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
});

export default WeatherSummary;
