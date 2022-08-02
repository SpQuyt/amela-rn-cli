const Helpers = require('utils/helpers');
const CustomPromise = require('utils/promises');
const ChangeAppIcon = require('features/ChangeAppIcon');
const SetupFastlane = require('features/SetupFastlane');
const Texts = require('utils/texts');

// eslint-disable-next-line no-unused-vars
const exec = async (appName, repoURL) => {
  // Change app icon to default AMELA icon
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName });
  await ChangeAppIcon.exec({ appNameWithoutHyphen, appName });
  console.log('Installation completed!');

  // Ask user if they want to set up fastlane
  const postInstallQuestion = 'Do you want to setup Fastlane?';
  const postInstallAnswerObj = await CustomPromise.getRadioButtonAnswerPromise(
    postInstallQuestion,
    [Texts.yes, Texts.no],
  );
  const postInstallAnswer = postInstallAnswerObj[postInstallQuestion];
  if (postInstallAnswer === Texts.yes) {
    await SetupFastlane.exec(appNameWithoutHyphen);
  }
};

const PostInstallation = {
  exec,
};

module.exports = PostInstallation;
