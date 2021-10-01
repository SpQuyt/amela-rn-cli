const Constants = require('../../constants');
const CustomPromise = require('../../promises');

const config = async ({ appName }) => {
  const newPath = `./${appName}`;
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/ios/Podfile`,
    'config = use_native_modules!',
    Constants.locationWhenInUseString,
  );
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && cd ios && pod install`,
    `Update react-native-permissions iOS to ${newPath}...`,
  );
};

const RNPermissions = {
  config,
};

module.exports = RNPermissions;
