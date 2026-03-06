import { CarPlay, InformationTemplate } from '@iternio/react-native-auto-play';

class CarPlayService {
  private template: InformationTemplate | null = null;
  private connected: boolean = false;
  private lastWeatherUpdate: number = 0;
  private cachedWeather: string = 'Loading...';

  public init() {
    try {
      const onConnect = () => {
        this.connected = true;
        this.template = new InformationTemplate({
          title: 'Horizon Pro',
          items: [
            { title: 'Heading', detail: '--°' },
            { title: 'Pitch', detail: '--°' },
            { title: 'Roll', detail: '--°' },
            { title: 'Weather', detail: 'Loading...' }
          ],
          actions: [{ id: 'refresh', title: 'Refresh' }],
          onActionButtonPressed: (e) => {
            console.log('Action pressed', e);
          }
        });
        CarPlay.setRootTemplate(this.template);
      };

      const onDisconnect = () => {
        this.connected = false;
        this.template = null;
      };

      CarPlay.emitter.addListener('didConnect', onConnect);
      CarPlay.emitter.addListener('didDisconnect', onDisconnect);
    } catch (e) {
      console.log('CarPlay/Android Auto not available in this environment');
    }
  }

  public async updateTelemetry(heading: number, pitch: number, roll: number, latitude: number | null, longitude: number | null) {
    if (!this.connected || !this.template) return;

    const now = Date.now();
    if (latitude && longitude && (now - this.lastWeatherUpdate > 5 * 60 * 1000 || this.cachedWeather === 'Loading...')) {
      this.lastWeatherUpdate = now;
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
        const response = await fetch(url);
        const data = await response.json();
        const tempC = data.current.temperature_2m;
        const tempF = Math.round((tempC * 9/5) + 32);
        
        let weatherDesc = 'Clear';
        const code = data.current.weather_code;
        if (code > 0 && code <= 3) weatherDesc = 'Cloudy';
        if (code > 3 && code <= 67) weatherDesc = 'Rain';
        if (code > 67 && code <= 77) weatherDesc = 'Snow';
        if (code > 80) weatherDesc = 'Storm';

        this.cachedWeather = `${tempF}°F, ${weatherDesc}`;
      } catch (e) {
        console.error('Failed to fetch weather for CarPlay', e);
      }
    }

    try {
      this.template.updateInformationTemplateItems([
        { title: 'Heading', detail: `${Math.round(heading)}°` },
        { title: 'Pitch', detail: `${Math.round(pitch)}°` },
        { title: 'Roll', detail: `${Math.round(roll)}°` },
        { title: 'Weather', detail: this.cachedWeather }
      ]);
    } catch (e) {
      console.error('Failed to update CarPlay template', e);
    }
  }
}

export const carPlayService = new CarPlayService();
