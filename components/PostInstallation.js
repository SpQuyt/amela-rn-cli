const ChangeAppIcon = require('../features/ChangeAppIcon');
const CustomPromise = require('../promises');
const Texts = require('../texts');
const Simulator = require('./Simulator');

const isWinOS = process.platform === 'win32';

// eslint-disable-next-line no-unused-vars
const exec = async (appName, repoURL) => {
  // Change app icon to default AMELA icon
  const appNameWithoutHyphen = `${appName.trim().replace(/-/g, '').replace(/ /g, '')}`;
  await ChangeAppIcon.exec({ appNameWithoutHyphen, appName });

  if (!isWinOS) {
    // Ask user what to do next
    console.log('Installation completed!');
    const postInstallQuestion = 'What do you want to do next?';
    const postInstallAnswerObj = await CustomPromise.getRadioButtonAnswerPromise(
      postInstallQuestion,
      [Texts.runOnIOSSimulator, Texts.nothing],
    );
    const postInstallAnswer = postInstallAnswerObj[postInstallQuestion];
    // Running on device iOS
    if (postInstallAnswer === Texts.runOnIOSSimulator) {
      await Simulator.runIOS(appName);
    }
  }
};

const PostInstallation = {
  exec,
};

module.exports = PostInstallation;
