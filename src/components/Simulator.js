const CustomPromise = require('utils/promises');

const runIOS = async (appName) => {
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && npx react-native run-ios`,
    'Running iOS...',
  );
};

const Simulator = {
  runIOS,
};

module.exports = Simulator;
