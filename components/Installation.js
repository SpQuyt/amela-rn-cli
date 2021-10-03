const fs = require('fs');
const CustomPromise = require('../promises');
const Questions = require('./Questions');
const Git = require('./Git');
const BaseTemplet = require('./config/BaseTemplet');

const currPath = './react-native-templet-v1';

const handleInstallPackages = async ({ appName, appDisplayName, repoURL }) => {
  const newPath = `./${appName}`;

  if (!fs.existsSync(newPath)) {
    await CustomPromise.gitClonePromise();
    fs.renameSync(currPath, newPath);
    if (repoURL) {
      await CustomPromise.execCommandLinePromise(`cd ${currPath} && rm -rf .git`);
      await Git.addNewGitRemote({ appName, repoURL });
    }
    await BaseTemplet.configAndInstall({ appName, appDisplayName });
    return true;
  }
  if (fs.existsSync(newPath)) {
    const askQuestionOverrideRepo = await Questions.askOverrideRepo();
    if (askQuestionOverrideRepo.toString().trim().toLowerCase() === 'y') {
      await CustomPromise.gitClonePromise();
      await CustomPromise.execCommandLinePromise(`cp -a ${currPath}/. ${newPath}/`, `Copying folder ${currPath} to ${newPath}...`);
      await CustomPromise.execCommandLinePromise(`rm -r ${currPath.replace('./', '')}`, `Removing folder ${currPath}...`);
      if (repoURL) {
        await CustomPromise.execCommandLinePromise(`cd ${currPath} && rm -rf .git`);
        await Git.addNewGitRemote({ appName, repoURL });
      }
      await BaseTemplet.configAndInstall({ appName, appDisplayName });
      return true;
    }
    return false;
  }
  return true;
};

const Installation = {
  handleInstallPackages,
};

module.exports = Installation;
