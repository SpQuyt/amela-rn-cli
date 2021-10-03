const CustomPromise = require('../../promises');

const config = async ({ appName }) => {
  const newPath = `./${appName}`;
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/ios/Podfile`,
    'use_flipper!()',
    "use_flipper!({ 'Flipper-Folly' => '2.5.3', 'Flipper' => '0.87.0', 'Flipper-RSocket' => '1.3.1' })",
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/ios/Podfile`,
    'react_native_post_install(installer)',
    'flipper_post_install(installer)',
  );
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && cd ios && pod install`,
    `Update flipper iOS to ${newPath}...`,
  );
};

const Flipper = {
  config,
};

module.exports = Flipper;
