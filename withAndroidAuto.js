const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAndroidAuto(config) {
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // Add meta-data for Android Auto
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    const hasCarApp = application['meta-data'].some(
      (item) => item.$['android:name'] === 'com.google.android.gms.car.application'
    );

    if (!hasCarApp) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.gms.car.application',
          'android:resource': '@xml/automotive_app_desc',
        },
      });
    }

    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      if (!fs.existsSync(resDir)) {
        fs.mkdirSync(resDir, { recursive: true });
      }

      const automotiveAppDescPath = path.join(resDir, 'automotive_app_desc.xml');
      const automotiveAppDescContent = `<?xml version="1.0" encoding="utf-8"?>
<automotiveApp>
  <uses name="template" />
</automotiveApp>
`;

      fs.writeFileSync(automotiveAppDescPath, automotiveAppDescContent);
      return config;
    },
  ]);

  return config;
};
