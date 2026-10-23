import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calculadora.bcv',
  appName: 'Calculadora BCV',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {},
};

export default config;
