
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';

interface CompassDiscProps {
  heading: number;
  isDarkMode: boolean;
}

const CompassDisc: React.FC<CompassDiscProps> = ({ heading, isDarkMode }) => {
  const { width, height } = useWindowDimensions();
  const SIZE = Math.min(width * 0.85, height * 0.45);

  const strokeColor = isDarkMode ? '#e4e4e7' : '#18181b';
  const secondaryColor = isDarkMode ? '#3f3f46' : '#a1a1aa';
  const accentColor = '#ef4444';

  const getCardinal = (angle: number) => {
    const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
    return directions[Math.round(angle / 45) % 8];
  };

  return (
    <View style={[styles.container, { width: SIZE, height: SIZE }]}>
      <View style={[styles.outerRing, { borderColor: isDarkMode ? '#27272a' : '#f4f4f5', width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]}>
        <Svg
          viewBox="0 0 400 400"
          style={{
            width: SIZE,
            height: SIZE,
            transform: [{ rotate: `${-heading}deg` }]
          }}
        >
          {/* Compass Ticks */}
          <G>
            {[...Array(72)].map((_, i) => (
              <Line
                key={i}
                x1="200"
                y1={i % 9 === 0 ? "20" : "30"}
                x2="200"
                y2="45"
                stroke={i % 9 === 0 ? strokeColor : secondaryColor}
                strokeWidth={i % 9 === 0 ? "3" : "1"}
                transform={`rotate(${i * 5}, 200, 200)`}
              />
            ))}
          </G>

          {/* Cardinal Points */}
          <SvgText x="200" y="85" textAnchor="middle" fontSize="32" fontWeight="900" fill={accentColor}>N</SvgText>
          <G transform="rotate(90, 200, 200)">
            <SvgText x="200" y="85" textAnchor="middle" fontSize="28" fontWeight="700" fill={strokeColor}>E</SvgText>
          </G>
          <G transform="rotate(180, 200, 200)">
            <SvgText x="200" y="85" textAnchor="middle" fontSize="28" fontWeight="700" fill={strokeColor}>S</SvgText>
          </G>
          <G transform="rotate(270, 200, 200)">
            <SvgText x="200" y="85" textAnchor="middle" fontSize="28" fontWeight="700" fill={strokeColor}>W</SvgText>
          </G>

          {/* Degrees */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <G key={deg} transform={`rotate(${deg}, 200, 200)`}>
              <SvgText x="200" y="115" textAnchor="middle" fontSize="12" fill={secondaryColor}>{deg}°</SvgText>
            </G>
          ))}
        </Svg>
      </View>

      {/* Needle Pointer (Stationary) */}
      <View style={styles.needleContainer}>
        <View style={styles.needleLine} />
        <View style={styles.needleArrow} />
      </View>

      {/* Center Readout */}
      <View style={styles.readout}>
        <Text style={[styles.degreeText, { color: isDarkMode ? 'white' : 'black' }]}>
          {Math.round(heading)}°
        </Text>
        <Text style={[styles.cardinalText, { color: secondaryColor }]}>
          {getCardinal(heading)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleContainer: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
    zIndex: 10,
  },
  needleLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ef4444',
    borderRadius: 1,
  },
  needleArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  readout: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  degreeText: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  cardinalText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});

export default CompassDisc;
