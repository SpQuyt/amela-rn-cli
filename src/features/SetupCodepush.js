/* eslint-disable no-await-in-loop */
const fs = require('fs');
const os = require('os');
const { default: axios } = require('axios');
const chalk = require('chalk');
const Questions = require('components/Questions');
const Helpers = require('utils/helpers');
const CustomPromise = require('utils/promises');
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const updateKeysInEnvFiles = async ({
  rootProject, platformOS, codepushAppName, apiKey, savedAppcenterApiKeyPath,
}) => {
  try {
    console.log(`⌛ [${platformOS}] Getting Environment Deployment keys of app ${chalk.bold(`${codepushAppName}-${platformOS.toLowerCase()}`)}...`);
    const axiosResult = await axios.get(`https://api.appcenter.ms/v0.1/apps/Amela/${codepushAppName}-${platformOS.toLowerCase()}/deployments`, {
      headers: {
        Accept: 'application/json',
        'X-API-Token': apiKey,
      },
    });
    const deploymentKeys = {
      devKey: axiosResult.data.find((item) => item.name === 'Development').key,
      stagingKey: axiosResult.data.find((item) => item.name === 'Staging').key,
      productionKey: axiosResult.data.find((item) => item.name === 'Production').key,
    };

    const oldString = `CODEPUSH_${platformOS.toUpperCase()}_DEVELOPMENT_KEY="__temp__code__push__key__"`;
    await CustomPromise.replaceStringFilePromise(`${rootProject}/.env`, oldString, `CODEPUSH_${platformOS.toUpperCase()}_DEVELOPMENT_KEY=${deploymentKeys.devKey}`);
    await CustomPromise.replaceStringFilePromise(`${rootProject}/.env.development`, oldString, `CODEPUSH_${platformOS.toUpperCase()}_DEVELOPMENT_KEY=${deploymentKeys.devKey}`);
    await CustomPromise.replaceStringFilePromise(`${rootProject}/.env.staging`, oldString, `CODEPUSH_${platformOS.toUpperCase()}_DEVELOPMENT_KEY=${deploymentKeys.stagingKey}`);
    await CustomPromise.replaceStringFilePromise(`${rootProject}/.env.production`, oldString, `CODEPUSH_${platformOS.toUpperCase()}_DEVELOPMENT_KEY=${deploymentKeys.productionKey}`);
  } catch (err) {
    console.log(`❗❗❗ ${chalk.red(err)}`);
    await CustomPromise.execCommandLinePromise(`rm -rf ${savedAppcenterApiKeyPath}`);
  }
};

// eslint-disable-next-line no-unused-vars
const deleteAppsCodepush = async ({ apiKey, savedAppcenterApiKeyPath }) => {
  try {
    console.log(`⌛ Getting all apps of organization ${chalk.yellow('AMELA')}...`);
    const listAppsRemoteAxios = await axios.get('https://api.appcenter.ms/v0.1/apps', {
      headers: {
        Accept: 'application/json',
        'X-API-Token': apiKey,
      },
    });
    const listAppsRemote = listAppsRemoteAxios.data;
    const filterListAppsRemote = listAppsRemote.filter((lARItem) => lARItem.name.includes('testproject'));
    console.log(chalk.bold(`\t=>  List apps to delete is: [${filterListAppsRemote.map((fLARItem) => fLARItem.name).join(', ')}]`));

    // eslint-disable-next-line no-restricted-syntax
    for (const fLARItem of filterListAppsRemote) {
      console.log(`⌛ Deleting ${fLARItem.name}...`);
      await axios.delete(`https://api.appcenter.ms/v0.1/apps/Amela/${fLARItem.name}`, {
        headers: {
          Accept: 'application/json',
          'X-API-Token': apiKey,
        },
      });
      await Helpers.sleep(5000);
    }
  } catch (err) {
    console.log(`❗❗❗ ${chalk.red(err)}`);
    await CustomPromise.execCommandLinePromise(`rm -rf ${savedAppcenterApiKeyPath}`);
  }
};

const exec = async ({ appName }) => {
  // Check if the environment is DEV, then read from env.development file
  let codepushAppName = appName;
  if (process.env.IOS_APP_FOLDER_NAME) {
    codepushAppName = process.env.IOS_APP_FOLDER_NAME;
  } else if (!appName && !process.env.IOS_APP_FOLDER_NAME) {
    const codepushAppNameObjPromise = await Questions.askCodepushConfig();
    codepushAppName = codepushAppNameObjPromise.codepushAppName;
  }

  // rootProject path + app folder name (for iOS and Android)
  let rootProject; let appIosAndroidFolderName;
  if (appName) {
    rootProject = `./${appName}`;
    appIosAndroidFolderName = Helpers.getIosAppNameFolderFromRootFolder(rootProject);
  } else if (process.env.IOS_APP_FOLDER_NAME && !appName) {
    rootProject = './TestProject';
    appIosAndroidFolderName = 'testproject';
  } else {
    rootProject = '.';
    appIosAndroidFolderName = Helpers.getIosAppNameFolderFromRootFolder();
  }

  // Check if local client has saved ApiKey file
  let apiKey;
  const savedAppcenterApiKeyPath = `${os.homedir()}/.auto_build_appcenter_api_key.txt`;
  if (fs.existsSync(savedAppcenterApiKeyPath)) {
    const savedApiKeyContent = await CustomPromise.readFilePromise(savedAppcenterApiKeyPath);
    if (savedApiKeyContent) {
      apiKey = savedApiKeyContent;
    }
  }
  if (!apiKey) {
    const apiKeyAnswer = await Questions.askAppCenterApiKey();
    apiKey = apiKeyAnswer.apiKey;
    console.log('⌛ Creating .auto_build_appcenter_api_key.txt file...');
    await CustomPromise.execCommandLinePromise(`rm -rf ${savedAppcenterApiKeyPath}`);
    await CustomPromise.createNewFilePromise(savedAppcenterApiKeyPath, apiKey);
  }

  // Check if the environment is DEV, then delete 'testproject' apps on AppCenter Codepush
  if (process.env.IOS_APP_FOLDER_NAME) {
    await deleteAppsCodepush({ apiKey, savedAppcenterApiKeyPath });
  }

  // Create AppCenter iOS app
  await CustomPromise.execCommandLinePromise(`appcenter orgs apps create -d ${codepushAppName}-ios -o iOS -p React-Native -n Amela`, 'Creating iOS app on Appcenter Codepush...');

  // Create AppCenter Android app
  await CustomPromise.execCommandLinePromise(`appcenter orgs apps create -d ${codepushAppName}-android -o Android -p React-Native -n Amela`, 'Creating Android app on Appcenter Codepush...');

  // Create AppCenter iOS 3 environments
  await CustomPromise.execCommandLinePromise(
    `appcenter codepush deployment add -a Amela/${codepushAppName}-ios Development && appcenter codepush deployment add -a Amela/${codepushAppName}-ios Staging && appcenter codepush deployment add -a Amela/${codepushAppName}-ios Production`,
    'Creating 3 environments for iOS...',
  );
  console.log('⌛ [iOS] Updating Codepush Deployment keys...');
  await updateKeysInEnvFiles({
    platformOS: 'iOS', codepushAppName, rootProject, apiKey, savedAppcenterApiKeyPath,
  });

  // Create AppCenter Android 3 environments
  await CustomPromise.execCommandLinePromise(
    `appcenter codepush deployment add -a Amela/${codepushAppName}-android Development && appcenter codepush deployment add -a Amela/${codepushAppName}-android Staging && appcenter codepush deployment add -a Amela/${codepushAppName}-android Production`,
    'Creating 3 environments for Android...',
  );
  console.log('⌛ [Android] Updating Codepush Deployment keys...');
  await updateKeysInEnvFiles({
    platformOS: 'Android', codepushAppName, rootProject, apiKey, savedAppcenterApiKeyPath,
  });

  // Config package.json
  const packageJsonContent = await CustomPromise.readFilePromise(`${rootProject}/package.json`);
  if (!packageJsonContent.toString().includes('code-push-ios-develop')) {
    console.log('⌛ Updating package.json...');
    await CustomPromise.replaceStringFilePromise(
      `${rootProject}/package.json`,
      '"open-folder-aab": "open ./android/app/build/outputs/bundle",',
      `"open-folder-aab": "open ./android/app/build/outputs/bundle",\n        "code-push-ios-develop": "appcenter codepush release-react -a Amela/${codepushAppName}-ios -d Development -t 1.0.0",\n        "code-push-ios-staging": "appcenter codepush release-react -a Amela/${codepushAppName}-ios -d Staging -t 1.0.0",\n        "code-push-ios-production": "appcenter codepush release-react -a Amela/${codepushAppName}-ios -d Production -t 1.0.0",\n        "code-push-android-develop": "appcenter codepush release-react -a Amela/${codepushAppName}-android -d Development -t 1.0.0",\n        "code-push-android-staging": "appcenter codepush release-react -a Amela/${codepushAppName}-android -d Staging -t 1.0.0",\n        "code-push-android-production": "appcenter codepush release-react -a Amela/${codepushAppName}-android -d Production -t 1.0.0",\n        "push-develop": "yarn code-push-ios-develop && yarn code-push-android-develop",\n        "push-staging": "yarn code-push-ios-staging && yarn code-push-android-staging",\n        "push-production": "yarn code-push-ios-production && yarn code-push-android-production",`,
    );
  }

  // Config AppDelegate.mm
  const appDelegatePath = `${rootProject}/ios/${appIosAndroidFolderName}/AppDelegate.mm`;
  const appDelegateContent = await CustomPromise.readFilePromise(appDelegatePath);
  if (!appDelegateContent.toString().includes('import <CodePush/CodePush.h>')) {
    console.log('⌛ [iOS] Updating AppDelegate.mm...');
    await CustomPromise.replaceStringFilePromise(
      appDelegatePath,
      '#import <React/RCTRootView.h>',
      '#import <React/RCTRootView.h>\n#import <CodePush/CodePush.h>',
    );
    await CustomPromise.replaceStringFilePromise(
      appDelegatePath,
      'return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];',
      'return [CodePush bundleURL];',
    );
  }

  // Config MainApplication.java
  const mainApplicationPath = `${rootProject}/android/app/src/main/java/com/${appIosAndroidFolderName.toLowerCase()}/MainApplication.java`;
  const mainApplicationContent = await CustomPromise.readFilePromise(mainApplicationPath);
  if (!mainApplicationContent.toString().includes('import com.microsoft.codepush.react.CodePush;')) {
    console.log('⌛ [Android] Updating MainApplication.java...');
    await CustomPromise.replaceStringFilePromise(
      mainApplicationPath,
      'import java.util.List;',
      'import java.util.List;\nimport com.microsoft.codepush.react.CodePush;',
    );
    await CustomPromise.replaceStringFilePromise(
      mainApplicationPath,
      'return packages;',
      'packages.add(new CodePush(getResources().getString(R.string.CodePushDeploymentKey), getApplicationContext(), BuildConfig.DEBUG));\n          return packages;',
    );
    await CustomPromise.replaceStringFilePromise(
      mainApplicationPath,
      '@Override\n        protected String getJSMainModuleName() {\n          return "index";\n        }',
      '@Override\n        protected String getJSMainModuleName() {\n          return "index";\n        }\n        @Override\n        protected String getJSBundleFile() {\n            return CodePush.getJSBundleFile();\n        }',
    );
  }

  // Config android/app/build.gradle
  const appBuildGradlePath = `${rootProject}/android/app/build.gradle`;
  const appBuildGradleContent = await CustomPromise.readFilePromise(appBuildGradlePath);
  if (!appBuildGradleContent.toString().includes('implementation project(\':react-native-code-push\')')) {
    console.log('⌛ [Android] Updating android/app/build.gradle...');
    await CustomPromise.replaceStringFilePromise(
      appBuildGradlePath,
      'implementation "com.facebook.react:react-native:+"  // From node_modules',
      'implementation "com.facebook.react:react-native:+"  // From node_modules\n    implementation project(\':react-native-code-push\')',
    );
  }

  console.log('✅ ✅ ✅ Done setting up AppCenter Codepush!');
};

const SetupCodepush = {
  exec,
};

module.exports = SetupCodepush;
