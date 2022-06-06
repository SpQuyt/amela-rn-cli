/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-nested-ternary */
const fs = require('fs');
const CustomPromise = require('../../promises');
const Constants = require('../../constants');
const xcode = require('../../xcode-utils/pbxProject');
const Helpers = require('../../helpers');

const config = async (
  {
    envTypeFull = 'development',
    appName,
    appDisplayName,
  },
) => {
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName });
  const envTypeShorten = envTypeFull === 'development'
    ? 'dev'
    : envTypeFull === 'staging'
      ? 'stg'
      : 'prod';

  // Changing Pod file minimum target deployment
  await CustomPromise.replaceStringFilePromise(
    `${appName}/ios/Podfile`,
    /platform :ios, .*/,
    'platform :ios, \'11.0\'',
  );

  // Creating XCScheme file
  const xcschemePath = `./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/xcshareddata/xcschemes/`;
  const constantXCScheme = envTypeFull === 'development'
    ? Constants.XCSchemeStringDEV.replace(/demo-app/g, appNameWithoutHyphen)
    : envTypeFull === 'staging'
      ? Constants.XCSchemeStringSTG.replace(/demo-app/g, appNameWithoutHyphen)
      : Constants.XCSchemeStringPROD.replace(/demo-app/g, appNameWithoutHyphen);
  if (!fs.existsSync(xcschemePath)) {
    await CustomPromise.execCommandLinePromise(
      `cd ./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/xcshareddata/ && mkdir xcschemes`,
      'Making folder xcschemes...',
    );
  }
  await CustomPromise.createNewFilePromise(
    `./${xcschemePath}/${appNameWithoutHyphen} ${envTypeShorten.toUpperCase()}.xcscheme`,
    constantXCScheme,
  );

  const infoPlistPath = `./${appName}/ios/${appNameWithoutHyphen}/Info.plist`;
  if (envTypeFull === 'development') {
    // Creating XCConfig file
    await CustomPromise.createNewFilePromise(
      `./${appName}/ios/Config.xcconfig`,
      Constants.XCConfigString,
    );
    // Setting up info plist
    await CustomPromise.replaceStringFilePromise(
      `${infoPlistPath}`,
      `<string>${appDisplayName}</string>`,
      '<string>RNC_APP_NAME</string>',
    );
    await CustomPromise.replaceStringFilePromise(
      `${infoPlistPath}`,
      '<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>',
      '<string>RNC_IOS_APP_ID</string>',
    );
    await CustomPromise.replaceStringFilePromise(
      `${infoPlistPath}`,
      '<string>1.0</string>',
      '<string>RNC_IOS_APP_VERSION_CODE</string>',
    );
    await CustomPromise.replaceStringFilePromise(
      `${infoPlistPath}`,
      '<string>1</string>',
      '<string>RNC_IOS_APP_BUILD_CODE</string>',
    );
  }

  // Setting pbxProject
  const pbxProjectPath = `./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/project.pbxproj`;
  const configFilePath = `./${appName}/ios/Config.xcconfig`;
  let uuid; let fileRef; let
    buildPhaseUUID;
  if (envTypeFull === 'development') {
    const myProj = xcode(pbxProjectPath);
    await CustomPromise.parseXCodeProjectPromise(myProj);
    const resourceFile = await myProj.addResourceFile(
      configFilePath,
      {},
      'Resources',
    );
    const resourceFileProcessed = await JSON.parse(
      JSON.stringify(resourceFile),
    );
    const buildPhaseFile = myProj.addBuildPhase(
      [],
      'PBXShellScriptBuildPhase',
      '',
      undefined,
      {
        name: '',
        shellPath: '/bin/sh',
        shellScript:
                    '"${SRCROOT}/../node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb" "${SRCROOT}/.." "${SRCROOT}/tmp.xcconfig"\n',
      },
    );
    buildPhaseUUID = JSON.parse(JSON.stringify(buildPhaseFile)).uuid;
    uuid = resourceFileProcessed.uuid;
    fileRef = resourceFileProcessed.fileRef;
    fs.writeFileSync(pbxProjectPath, myProj.writeSync());

    // PBX File Config.xcconfig
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      `path = "./${appName}/ios/Config.xcconfig"`,
      'path = Config.xcconfig',
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      '83CBB9F61A601CBA00E9B192 = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (',
      `83CBB9F61A601CBA00E9B192 = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t${fileRef} /* Config.xcconfig */,`,
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      'name = Pods;',
      '',
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      '13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,',
      `13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,\n\t\t\t\t${uuid} /* Config.xcconfig in Resources */,`,
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      /GCC_WARN_UNUSED_VARIABLE = YES;/g,
      'GCC_WARN_UNUSED_VARIABLE = YES;\n\t\t\t\tDEVELOPMENT_TEAM = "";\n\t\t\t\tINFOPLIST_OTHER_PREPROCESSOR_FLAGS = "-traditional";\n\t\t\t\tINFOPLIST_PREFIX_HEADER = "${BUILD_DIR}/GeneratedInfoPlistDotEnv.h";\n\t\t\t\tINFOPLIST_PREPROCESS = YES;',
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      /isa = XCBuildConfiguration;/g,
      `isa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = ${fileRef} /* Config.xcconfig */;`,
    );

    // PBX file script
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      `{\n\t\t\t\t\tvalue = ${buildPhaseUUID};\n\t\t\t\t\tcomment = ;\n\t\t\t\t},`,
      `${buildPhaseUUID} /* ShellScript */,`,
    );
  }
};

const RNConfigIOS = {
  config,
};

module.exports = RNConfigIOS;
