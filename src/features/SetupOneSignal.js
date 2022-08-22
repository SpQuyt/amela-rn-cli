const chalk = require('chalk');
const os = require('os');
const fs = require('fs');
const { default: axios } = require('axios');
const Constants = require('utils/constants');
const Helpers = require('utils/helpers');
const { execCommandLinePromise, readFilePromise } = require('utils/promises');
const CustomPromise = require('utils/promises');
const Questions = require('components/Questions');
const xcode = require('xcode-utils/pbxProject');

const createOneSignalApp = async ({
  appIosAndroidFolderName, userAuthKey, savedOnesignalUserAuthKeyPath, androidToken, androidSenderId, env,
}) => {
  try {
    // Convert .p12 to base64
    const fileP12Name = fs.readdirSync(`${os.homedir()}/Downloads/${appIosAndroidFolderName}_cert`, { withFileTypes: true })
      .filter((dirent) => dirent.isFile())
      .filter((dirent) => dirent.name.includes('.p12'))
      .find((dirent) => dirent.name.includes(env))?.name;
    await execCommandLinePromise(
      `cd ~/Downloads/${appIosAndroidFolderName}_cert && base64 ${fileP12Name} > ${appIosAndroidFolderName}_cert_${env}_base64`,
      '⌛ Converting .p12 to base64...',
    );
    const base64Content = await readFilePromise(`${os.homedir()}/Downloads/${appIosAndroidFolderName}_cert/${appIosAndroidFolderName}_cert_${env}_base64`);
    // Creating app
    console.log(`⌛ Creating OneSignal instance for app ${chalk.bold(`${appIosAndroidFolderName}-${env}...`)}`);
    const resultOnesignal = await axios.post('https://onesignal.com/api/v1/apps', {
      name: `${appIosAndroidFolderName}-${env}`,
      apns_env: 'production',
      apns_p12: base64Content,
      apns_p12_password: '',
      gcm_key: androidToken,
      android_gcm_sender_id: androidSenderId,
    }, {
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json',
        Authorization: `Basic ${userAuthKey}`,
      },
    });
    console.log(`✅ ✅ ✅ Done creating ${chalk.bold(`${appIosAndroidFolderName}-${env}...`)}!`);
    return {
      onesignalAppId: resultOnesignal.data.id,
    };
  } catch (err) {
    console.log(`❗❗❗ ${chalk.red(err)}`);
    await CustomPromise.execCommandLinePromise(`rm -rf ${savedOnesignalUserAuthKeyPath}`); return {
      onesignalAppId: undefined,
    };
  }
};

const exec = async ({ appName }) => {
  const { rootProject, appIosAndroidFolderName } = Helpers.getRootProjectAndAppFolderPath({ appName });

  /**
   *
   *
   * CONFIG LOCAL FILES + FOLDERS
   *
   *
   * */

  // Config android/app/build.gradle
  const appBuildGradlePath = `${rootProject}/android/app/build.gradle`;
  const appBuildGradleContent = await CustomPromise.readFilePromise(appBuildGradlePath);
  if (!appBuildGradleContent.toString().includes('apply plugin: \'com.onesignal.androidsdk.onesignal-gradle-plugin\'')) {
    CustomPromise.replaceStringFilePromise(
      appBuildGradlePath,
      'import com.android.build.OutputFile',
      "\nbuildscript {\n    repositories {\n        gradlePluginPortal()\n    }\n    dependencies {\n        classpath 'gradle.plugin.com.onesignal:onesignal-gradle-plugin:[0.12.10, 0.99.99]'\n    }\n}\n\napply plugin: 'com.onesignal.androidsdk.onesignal-gradle-plugin'\n\nimport com.android.build.OutputFile",
    );
  }

  // Config Info.plist
  const infoPlistPath = `${rootProject}/ios/${appIosAndroidFolderName}/Info.plist`;
  const infoPlistContent = await CustomPromise.readFilePromise(infoPlistPath);
  if (!infoPlistContent.toString().includes('<string>remote-notification</string>')) {
    CustomPromise.replaceStringFilePromise(
      infoPlistPath,
      '<key>UILaunchStoryboardName</key>',
      '<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>remote-notification</string>\n\t</array>\n\t<key>UILaunchStoryboardName</key>',
    );
  }

  const entitlementPath = `${rootProject}/ios/${appIosAndroidFolderName}/${appIosAndroidFolderName}.entitlements`;
  const entitlementReleasePath = `${rootProject}/ios/${appIosAndroidFolderName}/${appIosAndroidFolderName}Release.entitlements`;
  if (!fs.existsSync(entitlementPath) && !fs.existsSync(entitlementReleasePath)) {
    // Create file .entitlements
    console.log(`⌛ Creating file ${chalk.bold.yellow(`${appIosAndroidFolderName}.entitlements`)}...`);
    await CustomPromise.createNewFilePromise(
      entitlementPath,
      Constants.OneSignalEntitlementsString,
    );
    console.log(`⌛ Creating file ${chalk.bold.yellow(`${appIosAndroidFolderName}Release.entitlements`)}...`);
    await CustomPromise.createNewFilePromise(
      entitlementReleasePath,
      Constants.OneSignalEntitlementsString,
    );
  } else {
    console.log('❗ Entitlements files has already been created!');
  }

  // Config pbxproj
  const pbxProjectPath = `${rootProject}/ios/${appIosAndroidFolderName}.xcodeproj/project.pbxproj`;
  const myProj = xcode(pbxProjectPath);
  const pbxProjectContent = await CustomPromise.readFilePromise(pbxProjectPath);
  if (!pbxProjectContent.toString().includes('CODE_SIGN_ENTITLEMENTS')) {
    console.log(`⌛ Configuring file ${chalk.bold.yellow(pbxProjectPath)}...`);
    await CustomPromise.parseXCodeProjectPromise(myProj);
    // Add entitlements as resource
    const entitlementsResourceFile = await myProj.addResourceFile(
      entitlementPath,
      {},
      'Resources',
    );
    const entitlementsResourceFileProcessed = await JSON.parse(
      JSON.stringify(entitlementsResourceFile),
    );
    const entitlementsReleaseResourceFile = await myProj.addResourceFile(
      entitlementReleasePath,
      {},
      'Resources',
    );
    const entitlementsReleaseResourceFileProcessed = await JSON.parse(
      JSON.stringify(entitlementsReleaseResourceFile),
    );
    fs.writeFileSync(pbxProjectPath, myProj.writeSync());
    // Replace strings in pbxproj
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      `13B07FAE1A68108700A75B9A /* ${appIosAndroidFolderName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (`,
      `13B07FAE1A68108700A75B9A /* ${appIosAndroidFolderName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t${entitlementsResourceFileProcessed.fileRef} /* ${appIosAndroidFolderName}.entitlements */,`,
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      `13B07FAE1A68108700A75B9A /* ${appIosAndroidFolderName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (`,
      `13B07FAE1A68108700A75B9A /* ${appIosAndroidFolderName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t${entitlementsReleaseResourceFileProcessed.fileRef} /* ${appIosAndroidFolderName}Release.entitlements */,`,
    );
    // Delete strings in pbxproj
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      `00E356EC1AD99517003FC87E /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t${entitlementsResourceFileProcessed.uuid} /* ${appIosAndroidFolderName}.entitlements in Resources */,\n\t\t\t\t${entitlementsReleaseResourceFileProcessed.uuid} /* ${appIosAndroidFolderName}Release.entitlements in Resources */,\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t};`,
      '00E356EC1AD99517003FC87E /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t);\n\t\t\trunOnlyForDeploymentPostprocessing = 0;\n\t\t};',
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      '{\n\t\t\t\t\tvalue = 181E1CF20F9B4F8AA4DD2DC6;\n\t\t\t\t\tcomment = ;\n\t\t\t\t}',
      '181E1CF20F9B4F8AA4DD2DC6 /*  */',
    );
    // Have to replace string twice
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;',
      `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = ${appIosAndroidFolderName}/${appIosAndroidFolderName}.entitlements;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;`,
    );
    await CustomPromise.replaceStringFilePromise(
      `${pbxProjectPath}`,
      'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;',
      `ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = ${appIosAndroidFolderName}/${appIosAndroidFolderName}Release.entitlements;\n\t\t\t\tCLANG_ENABLE_MODULES = YES;`,
    );
  } else {
    console.log('❗ File pbxpbj cannot be replaced at some places!');
  }

  /**
   *
   *
   * CERTIFICATES + REMOTE
   *
   *
   * */

  // Delete all old files
  await execCommandLinePromise(
    `rm -rf ~/Downloads/${appIosAndroidFolderName}_cert`,
    '⌛ Deleting all old files...',
  );

  // Generate .p12
  const fastFilePath = `${rootProject}/fastlane/Fastfile`;
  if (!fs.existsSync(fastFilePath)) {
    console.log(`❗❗❗ No ${chalk.bold('Fastfile')} detected!`);
    console.log(`❗❗❗ Please use ${chalk.bold('amela-rn-cli --fastlane')} to create a ${chalk.bold('Fastfile')}`);
    return;
  }
  const fastFileContent = await CustomPromise.readFilePromise(fastFilePath);
  if (!fastFileContent.toString().includes('lane :get_push_cert do |options|')) {
    await CustomPromise.replaceStringFilePromise(
      fastFilePath,
      'lane :build_ios do |options|',
      `${Constants.FastlaneOnesignalString}\nlane :build_ios do |options|`,
    );
  }
  await execCommandLinePromise(
    `cd ${rootProject} && fastlane get_push_cert env:development`,
    `⌛ Generating .p12 file for Apple Push Certificate for environment ${chalk.bold.yellow('DEVELOPMENT')}...`,
  );
  await execCommandLinePromise(
    `cd ${rootProject} && fastlane get_push_cert env:staging`,
    `⌛ Generating .p12 file for Apple Push Certificate for environment ${chalk.bold.yellow('STAGING')}...`,
  );

  // Check if local client has saved UserAuthKey file
  let userAuthKey;
  const savedOnesignalUserAuthKeyPath = `${os.homedir()}/.auto_build_onesignal_user_auth_key.txt`;
  if (fs.existsSync(savedOnesignalUserAuthKeyPath)) {
    const savedUserAuthKeyContent = await CustomPromise.readFilePromise(savedOnesignalUserAuthKeyPath);
    if (savedUserAuthKeyContent) {
      userAuthKey = savedUserAuthKeyContent;
    }
  }
  if (!userAuthKey) {
    const userAuthKeyAnswer = await Questions.askOneSignalUserAuthKey();
    userAuthKey = userAuthKeyAnswer.userAuthKey;
    console.log('⌛ Creating .auto_build_onesignal_user_auth_key.txt file...');
    await CustomPromise.execCommandLinePromise(`rm -rf ${savedOnesignalUserAuthKeyPath}`);
    await CustomPromise.createNewFilePromise(savedOnesignalUserAuthKeyPath, userAuthKey);
  }

  // Get Android Keys
  const {
    androidSenderIdDev, androidTokenDev, androidSenderIdStg, androidTokenStg,
  } = await Questions.askFirebaseAndroidKeys();

  // Call OneSignal OpenAPI to create app
  const devOnesignal = await createOneSignalApp({
    appIosAndroidFolderName,
    userAuthKey,
    savedOnesignalUserAuthKeyPath,
    androidToken: androidTokenDev,
    androidSenderId: androidSenderIdDev,
    env: 'dev',
  });
  const stgOnesignal = await createOneSignalApp({
    appIosAndroidFolderName,
    userAuthKey,
    savedOnesignalUserAuthKeyPath,
    androidToken: androidTokenStg,
    androidSenderId: androidSenderIdStg,
    env: 'stg',
  });

  // Replace in .env file
  const oldString = 'ONE_SIGNAL_APP_ID="__temp__onesignal__app__id__"';
  await CustomPromise.replaceStringFilePromise(`${rootProject}/.env`, oldString, `ONE_SIGNAL_APP_ID=${devOnesignal.onesignalAppId}`);
  await CustomPromise.replaceStringFilePromise(`${rootProject}/.env.development`, oldString, `ONE_SIGNAL_APP_ID=${devOnesignal.onesignalAppId}`);
  await CustomPromise.replaceStringFilePromise(`${rootProject}/.env.staging`, oldString, `ONE_SIGNAL_APP_ID=${stgOnesignal.onesignalAppId}`);

  console.log('✅ ✅ ✅ Done setting up OneSignal!');
};

const SetupOneSignal = {
  exec,
};

module.exports = SetupOneSignal;
