// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Shield the Expo packager from inspecting the backend service folder
config.resolver.blockList = [
  /vikas-backend\/.*/
];

module.exports = config;
