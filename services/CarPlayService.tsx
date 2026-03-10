import { HybridAutoPlay, MapTemplate } from '@iternio/react-native-auto-play';
import CarDisplay from '../components/CarDisplay';

export interface TelemetryData {
  heading: number;
  pitch: number;
  roll: number;
  latitude: number | null;
  longitude: number | null;
  connected: boolean;
}

class CarPlayService {
  private template: MapTemplate | null = null;
  private connected: boolean = false;
  private telemetry: TelemetryData = {
    heading: 0,
    pitch: 0,
    roll: 0,
    latitude: null,
    longitude: null,
    connected: false,
  };
  private listeners: ((data: TelemetryData) => void)[] = [];

  public init() {
    try {
      const onConnect = () => {
        this.connected = true;
        this.telemetry.connected = true;
        this.notifyListeners();
        this.template = new MapTemplate({
          component: CarDisplay,
          onStopNavigation: () => {},
          mapButtons: {
            android: [
              { type: 'pan', image: { name: 'pan_tool', type: 'glyph' } }
            ]
          }
        });
        this.template.setRootTemplate();
      };

      const onDisconnect = () => {
        this.connected = false;
        this.telemetry.connected = false;
        this.notifyListeners();
        this.template = null;
      };

      HybridAutoPlay.addListener('didConnect', onConnect);
      HybridAutoPlay.addListener('didDisconnect', onDisconnect);
    } catch (e) {
      console.log('CarPlay/Android Auto not available in this environment');
    }
  }

  public getTelemetry() {
    return this.telemetry;
  }

  public subscribe(listener: (data: TelemetryData) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.telemetry));
  }

  public updateTelemetry(heading: number, pitch: number, roll: number, latitude: number | null, longitude: number | null) {
    this.telemetry = { ...this.telemetry, heading, pitch, roll, latitude, longitude };
    this.notifyListeners();
  }
}

export const carPlayService = new CarPlayService();
