// const fs = require('fs');
const Installation = require('components/Installation');
// const CustomPromise = require('utils/promises');
// const PostInstallation = require('components/PostInstallation');
const Questions = require('components/Questions');
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

// const currPath = 'react-native-templet-v1';

const handleAskFirstQuestions = async () => {
  // // Check if user want to override react-native-templet-v1
  // if (fs.existsSync(currPath)) {
  //   const askOverrideBaseTemplet = Questions.askOverrideBaseTemplet();
  //   if (askOverrideBaseTemplet.toString().trim().toLowerCase() === 'y') {
  //     await CustomPromise.execCommandLinePromise(`rm -r ${currPath.replace('./', '')}`, `Removing folder ${currPath}...`);
  //   } else {
  //     return undefined;
  //   }
  // }

  // Ask questions to get information
  const askProjectName = await Questions.askProjectName();
  const askRemoteURL = await Questions.askRemoteURL();
  const appName = askProjectName.trim().replace(/ /g, '');
  const repoURL = askRemoteURL.trim();
  console.log(`FolderName: ${appName}`);
  console.log(`AppName: ${appName.trim().replace(/-/g, '')}`);
  console.log(`Repo URL: ${repoURL}`);
  const askConfirmInfoOk = await Questions.askConfirmInfoOk();
  if (askProjectName && askConfirmInfoOk === 'y') {
    return {
      appName,
      repoURL,
    };
  }
  return undefined;
};

const processExec = async ({
  appName, repoURL,
}) => {
  // // Change name and yarn install base templet
  // const installPackageBoolean = await Installation.handleInstallPackages({ appName, repoURL });
  // if (!installPackageBoolean) return;

  // // Post setup and installation
  // await PostInstallation.exec(appName);
  await Installation.handleInstallPackages({ appName, repoURL });
};

const exec = async () => {
  // If env is DEV, run CLI with default params
  if (!!process.env.PROJECT_NAME && !!process.env.PROJECT_DISPLAY_NAME && !!process.env.APP_CODE) {
    await processExec({
      appName: process.env.PROJECT_NAME,
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
      appName, repoURL,
    } = askQuestionsObject;

    await processExec({
      appName, repoURL,
    });
  }
};

const CreateNewProject = {
  exec,
};

module.exports = CreateNewProject;
