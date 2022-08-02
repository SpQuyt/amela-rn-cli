const fs = require('fs');
const Installation = require('components/Installation');
const CustomPromise = require('utils/promises');
const PostInstallation = require('components/PostInstallation');
const Questions = require('components/Questions');
const Flipper = require('components/config/Flipper');
const RNPermissions = require('components/config/RNPermissions');
const RNConfigEnv = require('components/config/RNConfigEnv');
const RNConfigAndroid = require('components/config/RNConfigAndroid');
const RNConfigIOS = require('components/config/RNConfigIOS');
const LanguageAndRegion = require('components/config/LanguageAndRegion');
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const currPath = 'react-native-templet-v1';

const handleAskFirstQuestions = async () => {
  // Check if user want to override react-native-templet-v1
  if (fs.existsSync(currPath)) {
    const askOverrideBaseTemplet = Questions.askOverrideBaseTemplet();
    if (askOverrideBaseTemplet.toString().trim().toLowerCase() === 'y') {
      await CustomPromise.execCommandLinePromise(`rm -r ${currPath.replace('./', '')}`, `Removing folder ${currPath}...`);
    } else {
      return undefined;
    }
  }

  // Ask questions to get information
  const askProjectName = await Questions.askProjectName();
  const askProjectDisplayName = await Questions.askProjectDisplayName();
  const askAppCode = await Questions.askAppCode();
  const askRemoteURL = await Questions.askRemoteURL();
  const appCode = askAppCode.trim();
  const appName = askProjectName.trim().replace(/ /g, '');
  const appDisplayName = askProjectDisplayName.trim().replace(/'|"|@/g, '');
  const repoURL = askRemoteURL.trim();
  console.log(`FolderName: ${appName}`);
  console.log(`AppName: ${appName.trim().replace(/-/g, '')}`);
  console.log(`AppDisplayName: ${appDisplayName}`);
  console.log(`AppCode: ${appCode}`);
  console.log(`Repo URL: ${repoURL}`);
  const askConfirmInfoOk = await Questions.askConfirmInfoOk();
  if (askProjectName && askProjectDisplayName && askAppCode && askConfirmInfoOk === 'y') {
    return {
      appCode,
      appName,
      appDisplayName,
      repoURL,
    };
  }
  return undefined;
};

const processExec = async ({
  appName, appDisplayName, appCode, repoURL,
}) => {
  // Change name and yarn install base templet
  const installPackageBoolean = await Installation.handleInstallPackages({ appName, appDisplayName, repoURL });
  if (!installPackageBoolean) return;

  // Setup Flipper
  await Flipper.config({ appName });

  // Setup RNPermissions
  await RNPermissions.config({ appName });

  // Setup RNConfigEnv
  await RNConfigEnv.config({ envTypeFull: 'development', appName, appDisplayName });
  await RNConfigEnv.config({ envTypeFull: 'staging', appName, appDisplayName });
  await RNConfigEnv.config({ envTypeFull: 'production', appName, appDisplayName });

  // Setup RNConfigAndroid
  await RNConfigAndroid.config({ appName, appDisplayName, appCode });
  console.log('Done setting up react-native-config Android!');

  // Setup RNConfigIOS
  await RNConfigIOS.config({ envTypeFull: 'development', appName, appDisplayName });
  await RNConfigIOS.config({ envTypeFull: 'staging', appName, appDisplayName });
  await RNConfigIOS.config({ envTypeFull: 'production', appName, appDisplayName });
  console.log('Done setting up react-native-config iOS!');

  // Setup language and region
  await LanguageAndRegion.config({ appName });
  console.log('Done setting up language and region!');

  // Post setup and installation
  await PostInstallation.exec(appName, repoURL);
};

const exec = async () => {
  // If env is DEV, run CLI with default params
  if (!!process.env.PROJECT_NAME && !!process.env.PROJECT_DISPLAY_NAME && !!process.env.APP_CODE) {
    await processExec({
      appName: process.env.PROJECT_NAME,
      appDisplayName: process.env.PROJECT_DISPLAY_NAME,
      appCode: process.env.APP_CODE,
      repoURL: undefined,
    });
    return;
  }

  // Ask questions before installing
  const askQuestionsObject = await handleAskFirstQuestions();
  // Install NPM packages
  if (askQuestionsObject) {
    const {
      appName, appDisplayName, appCode, repoURL,
    } = askQuestionsObject;

    await processExec({
      appName, appDisplayName, appCode, repoURL,
    });
  }
};

const CreateNewProject = {
  exec,
};

module.exports = CreateNewProject;
