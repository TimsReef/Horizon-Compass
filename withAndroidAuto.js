const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAuto(config) {
  return withAndroidManifest(config, async (config) => {
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
};
