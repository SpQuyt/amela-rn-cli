const Helpers = require('utils/helpers');
const ChangeAppIcon = require('features/ChangeAppIcon');
const SetupFastlane = require('features/SetupFastlane');
const Texts = require('utils/texts');
const SetupCodepush = require('features/SetupCodepush');
const Questions = require('./Questions');

// eslint-disable-next-line no-unused-vars
const exec = async (appName, repoURL) => {
  // Change app icon to default AMELA icon
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName });
  await ChangeAppIcon.exec({ appNameWithoutHyphen, appName });
  console.log('✅ ✅ ✅ Installation completed!');

  // If environment is DEV, do the following tasks
  if (process.env.PROJECT_NAME) {
    await SetupCodepush.exec(appNameWithoutHyphen);
    await SetupFastlane.exec(appNameWithoutHyphen);
    return;
  }

  // Ask user if they want to set up Codepush
  const codepushAnswer = await Questions.askQuestionYesNo({ question: 'Do you want to setup AppCenter Codepush?' });
  if (codepushAnswer === Texts.yes) {
    await SetupCodepush.exec(appNameWithoutHyphen);
  }

  // Ask user if they want to set up Fastlane
  const fastlaneAnswer = await Questions.askQuestionYesNo({ question: 'Do you want to setup Fastlane?' });
  if (fastlaneAnswer === Texts.yes) {
    await SetupFastlane.exec(appNameWithoutHyphen);
  }
};

const PostInstallation = {
  exec,
};

module.exports = PostInstallation;
