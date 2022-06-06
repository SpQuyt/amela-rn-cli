const semverDiff = require('semver-diff');
const boxen = require('boxen');
const semver = require('semver');
const pkgJson = require('package-json');
const chalk = require('chalk');

const { name, version } = require('./package.json');

const capitalizeFirstLetter = (currentString) => currentString[0].toUpperCase() + currentString.substring(1);

const checkUpdate = async () => {
  const { version: latestVersion } = await pkgJson(name);
  let verDiff;
  let msg;

  // Check if local package version is less than the remote version
  const updateAvailable = semver.lt(version, latestVersion);

  if (updateAvailable) {
    let updateType = '';

    // Check the type of version difference which is usually patch, minor, major etc.
    verDiff = semverDiff(version, latestVersion);

    if (verDiff) {
      updateType = capitalizeFirstLetter(verDiff);
    }

    msg = {
      updateAvailable: `${updateType} update available ${chalk.dim(version)} → ${chalk.green(latestVersion)}`,
      priority: `Priority: ${chalk.red('Mandatory')}`,
      runUpdate: `Run ${chalk.cyan(`npm i -g -f ${name}`)} to update.`,
    };
  }
  return {
    notifyType: verDiff,
    boxenObj: msg && boxen(`${msg.updateAvailable}\n${msg.priority}\n${msg.runUpdate}`, {
      margin: 1,
      padding: 1,
      align: 'center',
    }),
  };
};

const convertAppNameToWithoutHyphen = ({ appName, isLowerCase = false }) => {
  const appNameWithoutHyphen = `${appName.trim().replace(/-/g, '').replace(/ /g, '')}`;
  return isLowerCase ? appNameWithoutHyphen.toLowerCase() : appNameWithoutHyphen;
};

const Helpers = {
  checkUpdate,
  convertAppNameToWithoutHyphen,
};

module.exports = Helpers;
