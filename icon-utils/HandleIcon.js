/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const CustomPromise = require('../promises');

const outputPrefix = 'gen-icon';
const iosFolderName = 'AppIcon.appiconset';
const androidFolderName = 'android';

const generateIconIOS = async ({ inputFilePath, appName }) => {
  const getInsideProjPath = `${appName ? `${appName}/` : ''}`;
  const outputFilePathIOS = `./${getInsideProjPath}${outputPrefix}/${iosFolderName}`;
  // Generate resized images
  if (!fs.existsSync(outputFilePathIOS)) {
    await CustomPromise.execCommandLinePromise(
      `mkdir ${outputFilePathIOS}`,
      'Making folder icon AppIcon.appiconset...',
    );
  }
  const sizesArr = [40, 58, 60, 80, 87, 120, 180, 1024];
  for (const sizeItem of sizesArr) {
    const outputItemPath = `${outputFilePathIOS}/${sizeItem}.png`;
    await CustomPromise.generateIconsPromise(
      inputFilePath,
      outputItemPath,
      sizeItem,
    );
  }

  // Create Contents.json file and edit that file
  const contentFilePath = `${outputFilePathIOS}/Contents.json`;
  await CustomPromise.createNewFilePromise(contentFilePath, '');
  await CustomPromise.replaceStringFilePromise(
    contentFilePath,
    '',
    '{\n  "images" : [\n    {\n      "filename" : "40.png",\n      "idiom" : "iphone",\n      "scale" : "2x",\n      "size" : "20x20"\n    },\n    {\n      "filename" : "60.png",\n      "idiom" : "iphone",\n      "scale" : "3x",\n      "size" : "20x20"\n    },\n    {\n      "filename" : "58.png",\n      "idiom" : "iphone",\n      "scale" : "2x",\n      "size" : "29x29"\n    },\n    {\n      "filename" : "87.png",\n      "idiom" : "iphone",\n      "scale" : "3x",\n      "size" : "29x29"\n    },\n    {\n      "filename" : "80.png",\n      "idiom" : "iphone",\n      "scale" : "2x",\n      "size" : "40x40"\n    },\n    {\n      "filename" : "120.png",\n      "idiom" : "iphone",\n      "scale" : "3x",\n      "size" : "40x40"\n    },\n    {\n      "filename" : "120.png",\n      "idiom" : "iphone",\n      "scale" : "2x",\n      "size" : "60x60"\n    },\n    {\n      "filename" : "180.png",\n      "idiom" : "iphone",\n      "scale" : "3x",\n      "size" : "60x60"\n    },\n    {\n      "filename" : "1024.png",\n      "idiom" : "ios-marketing",\n      "scale" : "1x",\n      "size" : "1024x1024"\n    }\n  ],\n  "info" : {\n    "author" : "xcode",\n    "version" : 1\n  }\n}\n',
  );
  console.log('Done generating iOS icons!');
};

const generateIconAndroid = async ({ inputFilePath, appName }) => {
  const getInsideProjPath = `${appName ? `${appName}/` : ''}`;
  const outputFilePathAndroid = `./${getInsideProjPath}${outputPrefix}/${androidFolderName}`;
  // Generate resized images
  if (!fs.existsSync(outputFilePathAndroid)) {
    await CustomPromise.execCommandLinePromise(
      `mkdir ${outputFilePathAndroid}`,
      'Making folder icon android...',
    );
  }
  const sizesArr = [
    {
      name: 'mipmap-mdpi',
      size: 48,
    },
    {
      name: 'mipmap-hdpi',
      size: 72,
    },
    {
      name: 'mipmap-xhdpi',
      size: 96,
    },
    {
      name: 'mipmap-xxhdpi',
      size: 144,
    },
    {
      name: 'mipmap-xxxhdpi',
      size: 192,
    },
  ];
  for (const sizeItem of sizesArr) {
    if (!fs.existsSync(`${outputFilePathAndroid}/${sizeItem.name}/`)) {
      await CustomPromise.execCommandLinePromise(
        `mkdir ${outputFilePathAndroid}/${sizeItem.name}`,
        `Making folder ${sizeItem.name}...`,
      );
    }
    const outputItemPath = `${outputFilePathAndroid}/${sizeItem.name}/ic_launcher.png`;
    await CustomPromise.generateIconsPromise(
      inputFilePath,
      outputItemPath,
      sizeItem.size,
    );
    const outputItemPathRounded = `${outputFilePathAndroid}/${sizeItem.name}/ic_launcher_round.png`;
    await CustomPromise.generateIconsPromise(
      inputFilePath,
      outputItemPathRounded,
      sizeItem.size,
      true,
    );
  }
  console.log('Done generating Android icons!');
};

const installIconsIOS = async ({ appNameWithoutHyphen, appName }) => {
  const getInsideProjPath = `${appName ? `${appName}/` : ''}`;
  let currentAppName = appNameWithoutHyphen;
  if (!appNameWithoutHyphen) {
    /** Code to ask currentAppNameWithoutHyphen */
    // const listQuestionsAppName = [
    //   'App name without hyphen (folder inside folder \'ios\')',
    // ];
    // const resultAppName = await CustomPromise.promptGetListQuestionPromise(
    //   listQuestionsAppName,
    // );
    // currentAppName = resultAppName[listQuestionsAppName[0]];
    const getListDirNameInIosFolder = fs.readdirSync('./ios/', { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    const appNameWithXcodeProj = getListDirNameInIosFolder?.find((dirName) => dirName.includes('.xcodeproj'));
    currentAppName = appNameWithXcodeProj?.split('.')?.[0];
  }
  const sourcePath = `${getInsideProjPath}gen-icon/${iosFolderName}`;
  const destinationPath = `${getInsideProjPath}ios/${currentAppName}/Images.xcassets/${iosFolderName}`;
  await CustomPromise.execCommandLinePromise(
    `rm ./${destinationPath}/*`,
    `Reset folder ./${destinationPath}/...`,
  );
  await CustomPromise.execCommandLinePromise(
    `cp -a ./${sourcePath}/. ./${destinationPath}/`,
    'Installing icon IOS...',
  );
  console.log('Done installing iOS icons!');
};

const installIconsAndroid = async ({ appName }) => {
  const getInsideProjPath = `${appName ? `${appName}/` : ''}`;
  const sourcePath = `${getInsideProjPath}gen-icon/${androidFolderName}`;
  const destinationPath = `${getInsideProjPath}android/app/src/main/res`;
  const foldersNameArr = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
  ];
    // Delete old ic_launcher and copy new ic_launcher
  for (const folderItem of foldersNameArr) {
    const cmdCopyImg = `cp ./${sourcePath}/${folderItem}/ic_launcher.png ./${destinationPath}/${folderItem}/`;
    const cmdCopyImgRound = `cp ./${sourcePath}/${folderItem}/ic_launcher_round.png ./${destinationPath}/${folderItem}/`;
    await CustomPromise.execCommandLinePromise(
      `rm -rf ./${destinationPath}/${folderItem}/* && ${cmdCopyImg} && ${cmdCopyImgRound}`,
      `Installing icon android ${folderItem}`,
    );
  }
  console.log('Done installing Android icons!');
};

const HandleIcon = {
  generateIconAndroid,
  generateIconIOS,
  installIconsAndroid,
  installIconsIOS,
};

module.exports = HandleIcon;
