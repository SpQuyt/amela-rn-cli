const fs = require('fs');
const chalk = require('chalk');
const CustomPromise = require('utils/promises');
const BaseTemplet = require('./config/BaseTemplet');

const currPath = './react-native-templet-v1';

const handleInstallPackages = async ({ appName, appDisplayName, repoURL }) => {
  const newPath = `./${appName}`;
  const newPathWithCLI = `./${appName}-cli`;

  if (!fs.existsSync(newPath)) {
    await CustomPromise.gitClonePromise();
    fs.renameSync(currPath, newPath);
    await BaseTemplet.configAndInstall({ appName, appDisplayName });
    if (repoURL) {
      await CustomPromise.execCommandLinePromise(`cd ${newPath} && rm -rf .git`);
      await CustomPromise.execCommandLinePromise(`mv ${newPath} ${newPathWithCLI}`);
      await CustomPromise.gitClonePromise(undefined, repoURL);
      await CustomPromise.execCommandLinePromise(`cp -a ${newPathWithCLI}/. ${newPath}/`, `Copying folder ${newPathWithCLI} to ${newPath}...`);
      await CustomPromise.execCommandLinePromise(`rm -r ${newPathWithCLI.replace('./', '')}`, `Removing folder ${newPathWithCLI}...`);
    }
    return true;
  }
  if (fs.existsSync(newPath)) {
    console.log(
      chalk.red(
        'Folder with same name already existed!',
      ),
    );
    return false;
  }
  return true;
};

const Installation = {
  handleInstallPackages,
};

module.exports = Installation;
