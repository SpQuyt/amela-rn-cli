const fs = require('fs');
const chalk = require('chalk');
const CustomPromise = require('utils/promises');

const templateUrl = 'react-native-template-amela';

const handleInstallPackages = async ({ appName, repoURL }) => {
  const newPath = `./${appName}`;
  const appNameWithoutHyphen = appName.replace(/-/g, '');
  const templatePath = `./${appNameWithoutHyphen}`;

  if (!fs.existsSync(newPath)) {
    if (repoURL) {
      const repoUrlSplitArr = repoURL.split('/');
      const repoPath = `./${repoUrlSplitArr?.[repoUrlSplitArr.length - 1]?.replace('.git', '')}`;
      await CustomPromise.gitClonePromise(undefined, repoURL);
      fs.renameSync(repoPath, `${newPath}-from-git`);
      CustomPromise.execCommandLineSync(`npx react-native init ${appNameWithoutHyphen} --template ${templateUrl}`, 'Initializing project from template...');
      CustomPromise.execCommandLineSync(`cp -a ${templatePath}/* ${newPath}-from-git/`, `Copying folder ${templatePath} to ${newPath}-from-git...`);
      CustomPromise.execCommandLineSync(`rm -rf ${templatePath}`, `Removing folder ${templatePath}...`);
      fs.renameSync(`${newPath}-from-git`, newPath);
    }
    CustomPromise.execCommandLineSync(`npx react-native init ${appNameWithoutHyphen} --template ${templateUrl}`, 'Initializing project from template...');
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
