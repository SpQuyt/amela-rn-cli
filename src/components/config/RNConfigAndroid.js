const CustomPromise = require('utils/promises');
const Constants = require('utils/constants');
const Helpers = require('utils/helpers');

const config = async (
  {
    appName,
    appDisplayName,
    appCode,
  },
) => {
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName, isLowerCase: true });

  // Generate keystore files
  const keyStgName = `${appCode}-staging-key.keystore`;
  const aliasStg = `${appCode}-staging-alias`;
  const keyProdName = `${appCode}-production-key.keystore`;
  const aliasProd = `${appCode}-production-alias`;
  await CustomPromise.replaceStringFilePromise(
    `./${appName}/.gitignore`,
    '*.keystore',
    '',
  );
  await CustomPromise.createKeyStorePromise(appCode, 'staging');
  await CustomPromise.createKeyStorePromise(appCode, 'production');
  await CustomPromise.execCommandLinePromise(
    `mv ./${keyStgName} ./${appName}/android/app`,
    'Moving staging keystore...',
  );
  await CustomPromise.execCommandLinePromise(
    `mv ./${keyProdName} ./${appName}/android/app`,
    'Moving production keystore...',
  );
  await CustomPromise.appendFilePromise(
    `./${appName}/android/gradle.properties`,
    `\n# Infomation dev keystore\nDEBUG_STORE_FILE=debug.keystore\nDEBUG_KEY_ALIAS=androiddebugkey\nDEBUG_STORE_PASSWORD=android\nDEBUG_KEY_PASSWORD=android\n# Infomation staging keystore\nSTAGING_STORE_FILE=${keyStgName}\nSTAGING_KEY_ALIAS=${aliasStg}\nSTAGING_STORE_PASSWORD=${Constants.KeyStorePassword}\nSTAGING_KEY_PASSWORD=${Constants.KeyStorePassword}\n# Infomation product keystore\nPRODUCT_STORE_FILE=${keyProdName}\nPRODUCT_KEY_ALIAS=${aliasProd}\nPRODUCT_STORE_PASSWORD=${Constants.KeyStorePassword}\nPRODUCT_KEY_PASSWORD=${Constants.KeyStorePassword}\n`,
  );

  // Fixing app/build.gradle
  const appBuildGradlePath = `./${appName}/android/app/build.gradle`;
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'apply plugin: "com.android.application"\n',
    'apply plugin: "com.android.application"\nproject.ext.envConfigFiles = [\n    dev: ".env.development",\n    staging: ".env.staging",\n    product: ".env.production",\n    anothercustombuild: ".env",\n]\n',
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'project.ext.react = [\n    enableHermes: false,  // clean and rebuild if changing\n]\n\napply from: "../../node_modules/react-native/react.gradle"',
    'project.ext.react = [\n    enableHermes: false,  // clean and rebuild if changing\n]\n\napply from: "../../node_modules/react-native/react.gradle"\napply from: project(\':react-native-config\').projectDir.getPath() + "/dotenv.gradle"',
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    `defaultConfig {\n        applicationId "com.${appNameWithoutHyphen}"\n        minSdkVersion rootProject.ext.minSdkVersion\n        targetSdkVersion rootProject.ext.targetSdkVersion\n        versionCode 1\n        versionName "1.0"\n`,
    `defaultConfig {\n        applicationId env.get("ANDROID_APP_ID")\n        minSdkVersion rootProject.ext.minSdkVersion\n        targetSdkVersion rootProject.ext.targetSdkVersion\n        versionCode Integer.valueOf(env.get("ANDROID_APP_VERSION_CODE"))\n        versionName env.get("ANDROID_APP_VERSION_NAME")\n        multiDexEnabled true\n        resValue "string", "build_config_package", "com.${appNameWithoutHyphen}"\n`,
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'signingConfigs {\n        debug {\n            storeFile file(\'debug.keystore\')\n            storePassword \'android\'\n            keyAlias \'androiddebugkey\'\n            keyPassword \'android\'\n        }\n    }',
    'signingConfigs {\n        debug {\n            storeFile file(DEBUG_STORE_FILE)\n            storePassword DEBUG_STORE_PASSWORD\n            keyAlias DEBUG_KEY_ALIAS\n            keyPassword DEBUG_KEY_PASSWORD\n        }\n        development {\n            storeFile file(DEBUG_STORE_FILE)\n            storePassword DEBUG_STORE_PASSWORD\n            keyAlias DEBUG_KEY_ALIAS\n            keyPassword DEBUG_KEY_PASSWORD\n        }\n        staging {\n            storeFile file(STAGING_STORE_FILE)\n            storePassword STAGING_STORE_PASSWORD\n            keyAlias STAGING_KEY_ALIAS\n            keyPassword STAGING_KEY_PASSWORD\n        }\n        product {\n            storeFile file(PRODUCT_STORE_FILE)\n            storePassword PRODUCT_STORE_PASSWORD\n            keyAlias PRODUCT_KEY_ALIAS\n            keyPassword PRODUCT_KEY_PASSWORD\n        }\n    }',
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    '// applicationVariants are e.g. debug, release',
    'flavorDimensions "environment"\n    productFlavors {\n        dev {\n            dimension "environment"\n            resValue "string", "app_name", project.env.get("APP_NAME")\n            resValue "string", "CodePushDeploymentKey", project.env.get("CODEPUSH_ANDROID_DEVELOPMENT_KEY")\n            signingConfig signingConfigs.staging\n        }\n        staging {\n            dimension "environment"\n            resValue "string", "app_name", project.env.get("APP_NAME")\n            resValue "string", "CodePushDeploymentKey", project.env.get("CODEPUSH_ANDROID_DEVELOPMENT_KEY")\n            signingConfig signingConfigs.staging\n        }\n        product {\n            dimension "environment"\n            resValue "string", "app_name", project.env.get("APP_NAME")\n            resValue "string", "CodePushDeploymentKey", project.env.get("CODEPUSH_ANDROID_DEVELOPMENT_KEY")\n            signingConfig signingConfigs.product\n        }\n    }\n\n\n    // applicationVariants are e.g. debug, release\n',
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)\n',
    'apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)\napply from: "../../node_modules/react-native-code-push/android/codepush.gradle"\n',
  );
  await CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'signingConfig signingConfigs.debug\n            minifyEnabled enableProguardInReleaseBuilds',
    'minifyEnabled enableProguardInReleaseBuilds',
  );

  // Fixing settings.gradle
  const settingsGradlePath = `./${appName}/android/settings.gradle`;
  await CustomPromise.replaceStringFilePromise(
    settingsGradlePath,
    'apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)\ninclude \':app\'',
    'apply from: file("../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)\ninclude \':app\', \':react-native-code-push\'\nproject(\':react-native-code-push\').projectDir = new File(rootProject.projectDir, \'../node_modules/react-native-code-push/android/app\')\n',
  );

  // Fix res value string xml
  const resStringPath = `./${appName}/android/app/src/main/res/values/strings.xml`;
  await CustomPromise.replaceStringFilePromise(
    resStringPath,
    `<resources>\n    <string name="app_name">${appDisplayName}</string>\n</resources>`,
    '<resources/>',
  );

  // Fix Android disable dark-mode
  const resStylesPath = `./${appName}/android/app/src/main/res/values/styles.xml`;
  await CustomPromise.replaceStringFilePromise(
    resStylesPath,
    '<item name="android:textColor">#000000</item>',
    '<item name="android:textColor">#000000</item>\n<item name="android:forceDarkAllowed">false</item>',
  );

  // Fix Android build apk release file
  CustomPromise.replaceStringFilePromise(
    appBuildGradlePath,
    'proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"\n        }',
    `proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"\n        }\n\n        // This method is use to rename your release apk only\n        applicationVariants.all{\n            variant ->\n                variant.outputs.each{\n                    // On below line we are setting a name to our apk\n                    output->\n                        project.ext { appName = '${appCode}' }\n                        def formattedDate = new Date().format('yyyyMMdd-HHmm')\n                        def newName = output.outputFile.name\n                        def versionName = env.get("ANDROID_APP_VERSION_NAME")\n                        newName = newName.replace("app-", "$project.ext.appName-$formattedDate-$versionName-")\n                        output.outputFileName  = newName\n                }\n        }`,
  );
};

const RNConfigAndroid = {
  config,
};

module.exports = RNConfigAndroid;
