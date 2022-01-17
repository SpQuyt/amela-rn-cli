const fs = require('fs');
const HandleIcon = require('../icon-utils/HandleIcon');
const CustomPromise = require('../promises');

const outputPrefix = 'gen-icon';

const exec = async ({ appNameWithoutHyphen, appName }) => {
  let inputFilePath;
  if (appName) {
    inputFilePath = `./${appName}/defaultIcon.jpeg`;
  } else {
    // Ask for inputPath
    const listQuestionsInOut = ['inputFilePath (Image to generate app icon - JPEG, PNG)'];
    const resultInOut = await CustomPromise.promptGetListQuestionPromise(
      listQuestionsInOut,
    );
    inputFilePath = resultInOut[listQuestionsInOut[0]];
  }

  // Get output prefix folder
  if (!fs.existsSync(`./${outputPrefix}`)) {
    await CustomPromise.execCommandLinePromise(appName ? `cd ./${appName} && mkdir ${outputPrefix}` : `mkdir ${outputPrefix}`, 'Making folder gen-icon...');
  }

  // Generate icon for Android
  await HandleIcon.generateIconAndroid({ inputFilePath, appName });
  // Install icon for Android
  await HandleIcon.installIconsAndroid({ appName });

  // Generate icon for iOS
  await HandleIcon.generateIconIOS({ inputFilePath, appName });
  // Install icon for IOS
  await HandleIcon.installIconsIOS({ appNameWithoutHyphen, appName });

  // Delete gen-icon
  const getInsideProjPath = `${appName ? `${appName}/` : ''}`;
  await CustomPromise.execCommandLinePromise(`rm -rf ./${getInsideProjPath}gen-icon/`, 'Delete folder gen-icon...');
};

const ChangeAppIcon = {
  exec,
};

module.exports = ChangeAppIcon;
