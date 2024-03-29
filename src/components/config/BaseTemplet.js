const chalk = require('chalk');
const CustomPromise = require('utils/promises');
const Constants = require('utils/constants');

const isWinOS = process.platform === 'win32';

const configAndInstall = async ({ appName, appDisplayName }) => {
  const newPath = `./${appName}`;
  // Change app name and display name
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/app.json`,
    '"name": "DemoApp"',
    `"name": "${appName.trim().replace(/-/g, '').replace(/ /g, '')}"`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/app.json`,
    '"displayName": "Demo App"',
    `"displayName": "${appDisplayName}"`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/package.json`,
    '"name": "DemoApp"',
    `"name": "${appName.trim().replace(/-/g, '').replace(/ /g, '')}"`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/.gitignore`,
    'android',
    '',
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/.gitignore`,
    'ios',
    '',
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/.gitignore`,
    '//Pods/',
    '/ios/Pods/',
  );
  // Handle script postinstall
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/package.json`,
    '"postinstall": "patch-package && yarn pod-install",',
    '',
  );
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && yarn && npx react-native eject`,
    `Installing libraries to ${newPath} part 1...`,
  );
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && npx jetifier`,
    `Jetifier installing for Android to ${newPath}...`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/package.json`,
    '"pod-install": "cd ios && pod install && cd ..",',
    `"pod-install": "cd ios && pod install && cd ..",\n        "postinstall": "patch-package ${
      isWinOS ? ',' : '&& yarn pod-install",'
    }`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${newPath}/package.json`,
    '"postinstall": "patch-package && yarn pod-install",\n        \n        "prepare": "husky install",',
    '"postinstall": "patch-package && yarn pod-install",\n        "prepare": "husky install",',
  );
  await CustomPromise.execCommandLinePromise(
    `cd ./${appName} && yarn`,
    `Installing libraries to ${newPath} part 2...`,
  );

  if (!isWinOS) {
    // Pod repo update
    await CustomPromise.execCommandLinePromise(
      'pod repo update',
      'Pod repo updating...',
    );
    await CustomPromise.execCommandLinePromise(
      `cd ./${appName} && cd ios && pod install`,
      `Pod installing for iOS to ${newPath}...`,
    );

    // Add workspace check plist
    await CustomPromise.execCommandLinePromise(
      `cd ./${appName}/ios/${appName.trim().replace(/-/g, '').replace(/ /g, '')}.xcworkspace && mkdir xcshareddata`,
      'Making folder xcshareddata...',
    );
    await CustomPromise.createNewFilePromise(
      `./${appName}/ios/${appName.trim().replace(/-/g, '').replace(/ /g, '')}.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist`,
      Constants.IDEWorkspaceString,
    );
  } else {
    console.log(
      chalk.red(
        'Sorry! WindowsOS has not been fully supported yet. Please change to MacOS!',
      ),
    );
  }
};

const BaseTemplet = {
  configAndInstall,
};

module.exports = BaseTemplet;
