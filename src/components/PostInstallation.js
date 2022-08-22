const Helpers = require('utils/helpers');
const ChangeAppIcon = require('features/ChangeAppIcon');
const SetupFastlane = require('features/SetupFastlane');
const Texts = require('utils/texts');
const SetupCodepush = require('features/SetupCodepush');
const SetupOneSignal = require('features/SetupOneSignal');
const Questions = require('./Questions');

const exec = async (appName) => {
  // Change app icon to default AMELA icon
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName });
  await ChangeAppIcon.exec({ appNameWithoutHyphen, appName });
  console.log('✅ ✅ ✅ Installation completed!');

  // If environment is DEV, do the following tasks
  if (process.env.PROJECT_NAME) {
    await SetupCodepush.exec({ appName });
    await SetupFastlane.exec({ appName });
    await SetupOneSignal.exec({ appName });
    return;
  }

  // Ask user if they want to set up Codepush
  const codepushAnswer = await Questions.askQuestionYesNo({ question: 'Do you want to setup AppCenter Codepush?' });
  if (codepushAnswer === Texts.yes) {
    await SetupCodepush.exec({ appName });
  }

  // Ask user if they want to set up Fastlane
  const fastlaneAnswer = await Questions.askQuestionYesNo({ question: 'Do you want to setup Fastlane?' });
  if (fastlaneAnswer === Texts.yes) {
    await SetupFastlane.exec({ appName });
  }

  // Ask user if they want to set up OneSignal
  const oneSignalAnswer = await Questions.askQuestionYesNo({ question: 'Do you want to setup OneSignal?' });
  if (oneSignalAnswer === Texts.yes) {
    await SetupOneSignal.exec({ appName });
  }
};

const PostInstallation = {
  exec,
};

module.exports = PostInstallation;
