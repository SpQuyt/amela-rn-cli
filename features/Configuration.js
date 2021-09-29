const fs = require("fs");
const CustomPromise = require("../promises");
const Constants = require("../constants");
const xcode = require("../xcode-utils/pbxProject");

const isWinOS = process.platform === "win32";

const setUpIosConfigWithEnv = async (
    envTypeFull = "development",
    appName,
    appDisplayName,
    appCode
) => {
    const defaultAppId = `jp.demo.app`;
    const appNameWithoutHyphen = `${appName.trim().replace(/-/g, "").replace(/ /g, "")}`;
    // Setup env file
    const envFilePath = `./${appName}/.env.${envTypeFull}`;
    const envTypeShorten =
        envTypeFull === "development"
            ? "dev"
            : envTypeFull === "staging"
            ? "stg"
            : "prod";
    await CustomPromise.replaceStringFilePromise(
        `${envFilePath}`,
        `APP_NAME=Demo Development`,
        `APP_NAME=${appDisplayName} ${
            envTypeFull[0].toUpperCase() + envTypeFull.slice(1)
        }`
    );
    await CustomPromise.replaceStringFilePromise(
        `${envFilePath}`,
        `ANDROID_APP_ID=${defaultAppId}`,
        `ANDROID_APP_ID=com.apps.${appNameWithoutHyphen}.${envTypeShorten}`
    );
    await CustomPromise.replaceStringFilePromise(
        `${envFilePath}`,
        `IOS_APP_ID=${defaultAppId}`,
        `IOS_APP_ID=com.apps.${appNameWithoutHyphen}.${envTypeShorten}`
    );

    // Creating XCScheme file
    const xcschemePath = `./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/xcshareddata/xcschemes/`;
    const constantXCScheme =
        envTypeFull === "development"
            ? Constants.XCSchemeStringDEV.replace(/demo-app/g, appNameWithoutHyphen)
            : envTypeFull === "staging"
            ? Constants.XCSchemeStringSTG.replace(/demo-app/g, appNameWithoutHyphen)
            : Constants.XCSchemeStringPROD.replace(/demo-app/g, appNameWithoutHyphen);
    if (!fs.existsSync(xcschemePath)) {
        await CustomPromise.execCommandLinePromise(
            `cd ./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/xcshareddata/ && mkdir xcschemes`,
            `Making folder xcschemes...`
        );
    }
    await CustomPromise.createNewFilePromise(
        `./${xcschemePath}/${appNameWithoutHyphen} ${envTypeShorten.toUpperCase()}.xcscheme`,
        constantXCScheme
    );

    const infoPlistPath = `./${appName}/ios/${appNameWithoutHyphen}/Info.plist`;
    if (envTypeFull === "development") {
        // Creating XCConfig file
        await CustomPromise.createNewFilePromise(
            `./${appName}/ios/Config.xcconfig`,
            Constants.XCConfigString
        );
        // Setting up info plist
        await CustomPromise.replaceStringFilePromise(
            `${infoPlistPath}`,
            `<string>${appDisplayName}</string>`,
            `<string>RNC_APP_NAME</string>`
        );
        await CustomPromise.replaceStringFilePromise(
            `${infoPlistPath}`,
            `<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>`,
            `<string>RNC_IOS_APP_ID</string>`
        );
        await CustomPromise.replaceStringFilePromise(
            `${infoPlistPath}`,
            `<string>1.0</string>`,
            `<string>RNC_IOS_APP_VERSION_CODE</string>`
        );
        await CustomPromise.replaceStringFilePromise(
            `${infoPlistPath}`,
            `<string>1</string>`,
            `<string>RNC_IOS_APP_BUILD_CODE</string>`
        );
        await CustomPromise.replaceStringFilePromise(
            `${infoPlistPath}`,
            `<key>CFBundleDevelopmentRegion</key>\n\t<string>en</string>`,
            `<key>CFBundleDevelopmentRegion</key>\n\t<string>ja_JP</string>\n\t<key>CFBundleLocalizations</key>\n\t<array>\n\t\t<string>ja</string>\n\t</array>`
        );
    }

    // Setting pbxProject
    const pbxProjectPath = `./${appName}/ios/${appNameWithoutHyphen}.xcodeproj/project.pbxproj`;
    const configFilePath = `./${appName}/ios/Config.xcconfig`;
    let uuid, fileRef, buildPhaseUUID;
    if (envTypeFull === "development") {
        const myProj = xcode(pbxProjectPath);
        await CustomPromise.parseXCodeProjectPromise(myProj);
        const resourceFile = await myProj.addResourceFile(
            configFilePath,
            {},
            "Resources"
        );
        const resourceFileProcessed = await JSON.parse(
            JSON.stringify(resourceFile)
        );
        const buildPhaseFile = myProj.addBuildPhase(
            [],
            "PBXShellScriptBuildPhase",
            "",
            undefined,
            {
                name: "",
                shellPath: "/bin/sh",
                shellScript:
                    '"${SRCROOT}/../node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb" "${SRCROOT}/.." "${SRCROOT}/tmp.xcconfig"\n',
            }
        );
        buildPhaseUUID = JSON.parse(JSON.stringify(buildPhaseFile)).uuid;
        uuid = resourceFileProcessed.uuid;
        fileRef = resourceFileProcessed.fileRef;
        fs.writeFileSync(pbxProjectPath, myProj.writeSync());

        // PBX File Config.xcconfig
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            `path = "./${appName}/ios/Config.xcconfig"`,
            `path = Config.xcconfig`
        );
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            `83CBB9F61A601CBA00E9B192 = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (`,
            `83CBB9F61A601CBA00E9B192 = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t${fileRef} /* Config.xcconfig */,`
        );
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            `name = Pods;`,
            ``
        );
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            `13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,`,
            `13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,\n\t\t\t\t${uuid} /* Config.xcconfig in Resources */,`
        );
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            /GCC_WARN_UNUSED_VARIABLE = YES;/g,
            'GCC_WARN_UNUSED_VARIABLE = YES;\n\t\t\t\tDEVELOPMENT_TEAM = "";\n\t\t\t\tINFOPLIST_OTHER_PREPROCESSOR_FLAGS = "-traditional";\n\t\t\t\tINFOPLIST_PREFIX_HEADER = "${BUILD_DIR}/GeneratedInfoPlistDotEnv.h";\n\t\t\t\tINFOPLIST_PREPROCESS = YES;'
        );
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            /isa = XCBuildConfiguration;/g,
            `isa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = ${fileRef} /* Config.xcconfig */;`
        );

        // PBX file script
        await CustomPromise.replaceStringFilePromise(
            `${pbxProjectPath}`,
            `{\n\t\t\t\t\tvalue = ${buildPhaseUUID};\n\t\t\t\t\tcomment = ;\n\t\t\t\t},`,
            `${buildPhaseUUID} /* ShellScript */,`
        );
    }
};

const setUpAndroidConfigAllEnvs = async (appName, appDisplayName, appCode) => {
    const appNameWithoutHyphen = appName.toString().trim().replace(/-/g, "").replace(/ /g, "");
    // Generate keystore files
    const keyStgName = `${appCode}-staging-key.keystore`;
    const aliasStg = `${appCode}-staging-alias`;
    const keyProdName = `${appCode}-production-key.keystore`;
    const aliasProd = `${appCode}-production-alias`;
    await CustomPromise.replaceStringFilePromise(
        `./${appName}/.gitignore`,
        `*.keystore`,
        ``
    );
    await CustomPromise.createKeyStorePromise(appCode, "staging");
    await CustomPromise.createKeyStorePromise(appCode, "production");
    await CustomPromise.execCommandLinePromise(
        `mv ./${keyStgName} ./${appName}/android/app`,
        `Moving staging keystore...`
    );
    await CustomPromise.execCommandLinePromise(
        `mv ./${keyProdName} ./${appName}/android/app`,
        `Moving production keystore...`
    );
    await CustomPromise.appendFilePromise(
        `./${appName}/android/gradle.properties`,
        `\n# Infomation dev keystore\nDEBUG_STORE_FILE=debug.keystore\nDEBUG_KEY_ALIAS=androiddebugkey\nDEBUG_STORE_PASSWORD=android\nDEBUG_KEY_PASSWORD=android\n# Infomation staging keystore\nSTAGING_STORE_FILE=${keyStgName}\nSTAGING_KEY_ALIAS=${aliasStg}\nSTAGING_STORE_PASSWORD=${Constants.KeyStorePassword}\nSTAGING_KEY_PASSWORD=${Constants.KeyStorePassword}\n# Infomation product keystore\nPRODUCT_STORE_FILE=${keyProdName}\nPRODUCT_KEY_ALIAS=${aliasProd}\nPRODUCT_STORE_PASSWORD=${Constants.KeyStorePassword}\nPRODUCT_KEY_PASSWORD=${Constants.KeyStorePassword}\n`
    );

    // Fixing app/build.gradle
    const appBuildGradlePath = `./${appName}/android/app/build.gradle`;
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `apply plugin: \"com.android.application\"\n`,
        `apply plugin: \"com.android.application\"\nproject.ext.envConfigFiles = [\n    dev: \".env.development\",\n    staging: \".env.staging\",\n    product: \".env.production\",\n    anothercustombuild: \".env\",\n]\n`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `project.ext.react = [\n    enableHermes: false,  // clean and rebuild if changing\n]\n\napply from: \"../../node_modules/react-native/react.gradle\"`,
        `project.ext.react = [\n    enableHermes: false,  // clean and rebuild if changing\n]\n\napply from: \"../../node_modules/react-native/react.gradle\"\napply from: project(':react-native-config').projectDir.getPath() + \"/dotenv.gradle\"`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `defaultConfig {\n        applicationId \"com.${appNameWithoutHyphen}\"\n        minSdkVersion rootProject.ext.minSdkVersion\n        targetSdkVersion rootProject.ext.targetSdkVersion\n        versionCode 1\n        versionName \"1.0\"\n    }`,
        `defaultConfig {\n        applicationId env.get(\"ANDROID_APP_ID\")\n        minSdkVersion rootProject.ext.minSdkVersion\n        targetSdkVersion rootProject.ext.targetSdkVersion\n        versionCode Integer.valueOf(env.get(\"ANDROID_APP_VERSION_CODE\"))\n        versionName env.get(\"ANDROID_APP_VERSION_NAME\")\n        multiDexEnabled true\n        resValue \"string\", \"build_config_package\", \"com.${appNameWithoutHyphen}\"\n    }`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `signingConfigs {\n        debug {\n            storeFile file('debug.keystore')\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }`,
        `signingConfigs {\n        debug {\n            storeFile file(DEBUG_STORE_FILE)\n            storePassword DEBUG_STORE_PASSWORD\n            keyAlias DEBUG_KEY_ALIAS\n            keyPassword DEBUG_KEY_PASSWORD\n        }\n        development {\n            storeFile file(DEBUG_STORE_FILE)\n            storePassword DEBUG_STORE_PASSWORD\n            keyAlias DEBUG_KEY_ALIAS\n            keyPassword DEBUG_KEY_PASSWORD\n        }\n        staging {\n            storeFile file(STAGING_STORE_FILE)\n            storePassword STAGING_STORE_PASSWORD\n            keyAlias STAGING_KEY_ALIAS\n            keyPassword STAGING_KEY_PASSWORD\n        }\n        product {\n            storeFile file(PRODUCT_STORE_FILE)\n            storePassword PRODUCT_STORE_PASSWORD\n            keyAlias PRODUCT_KEY_ALIAS\n            keyPassword PRODUCT_KEY_PASSWORD\n        }\n    }`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `// applicationVariants are e.g. debug, release`,
        `flavorDimensions \"enviroment\"\n    productFlavors {\n        dev {\n            dimension \"enviroment\"\n            resValue \"string\", \"app_name\", project.env.get(\"APP_NAME\")\n            resValue \"string\", \"CodePushDeploymentKey\", project.env.get(\"CODEPUSH_ANDROID_DEVELOPMENT_KEY\")\n            signingConfig signingConfigs.staging\n        }\n        staging {\n            dimension \"enviroment\"\n            resValue \"string\", \"app_name\", project.env.get(\"APP_NAME\")\n            resValue \"string\", \"CodePushDeploymentKey\", project.env.get(\"CODEPUSH_ANDROID_DEVELOPMENT_KEY\")\n            signingConfig signingConfigs.staging\n        }\n        product {\n            dimension \"enviroment\"\n            resValue \"string\", \"app_name\", project.env.get(\"APP_NAME\")\n            resValue \"string\", \"CodePushDeploymentKey\", project.env.get(\"CODEPUSH_ANDROID_DEVELOPMENT_KEY\")\n            signingConfig signingConfigs.product\n        }\n    }\n\n\n    // applicationVariants are e.g. debug, release\n`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `apply from: file(\"../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle\"); applyNativeModulesAppBuildGradle(project)\n`,
        `apply from: file(\"../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle\"); applyNativeModulesAppBuildGradle(project)\napply from: \"../../node_modules/react-native-code-push/android/codepush.gradle\"\n`
    );
    await CustomPromise.replaceStringFilePromise(
        appBuildGradlePath,
        `signingConfig signingConfigs.debug\n            minifyEnabled enableProguardInReleaseBuilds`,
        `minifyEnabled enableProguardInReleaseBuilds`
    );
    

    // Fixing settings.gradle
    const settingsGradlePath = `./${appName}/android/settings.gradle`;
    await CustomPromise.replaceStringFilePromise(
        settingsGradlePath,
        `apply from: file(\"../node_modules/@react-native-community/cli-platform-android/native_modules.gradle\"); applyNativeModulesSettingsGradle(settings)\ninclude ':app'`,
        `apply from: file(\"../node_modules/@react-native-community/cli-platform-android/native_modules.gradle\"); applyNativeModulesSettingsGradle(settings)\ninclude ':app', ':react-native-code-push'\nproject(':react-native-code-push').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-code-push/android/app')\n`
    );

    // Fix res value string xml
    const resStringPath = `./${appName}/android/app/src/main/res/values/strings.xml`;
    await CustomPromise.replaceStringFilePromise(
        resStringPath,
        `<resources>\n    <string name=\"app_name\">${appDisplayName}</string>\n</resources>`,
        `<resources/>`
    );

    // Fix Android disable dark-mode
    const resStylesPath = `./${appName}/android/app/src/main/res/values/styles.xml`;
    await CustomPromise.replaceStringFilePromise(
        resStringPath,
        `<item name="android:textColor">#000000</item>`,
        `<item name="android:textColor">#000000</item>\n<item name="android:forceDarkAllowed">false</item>`
    );
};

const handleSetUpRNConfig = async (appName, appDisplayName, appCode) => {
    if (!isWinOS) {
        // Setup iOS
        await setUpIosConfigWithEnv(
            `development`,
            appName,
            appDisplayName,
            appCode
        );
        await setUpIosConfigWithEnv(`staging`, appName, appDisplayName, appCode);
        await setUpIosConfigWithEnv(`production`, appName, appDisplayName, appCode);
        console.log("Done setting up react-native-config iOS!");
    }

    // Setup Android
    await setUpAndroidConfigAllEnvs(appName, appDisplayName, appCode);
    console.log("Done setting up react-native-config Android!");
};

const Configuration = {
    setUpIosConfigWithEnv,
    setUpAndroidConfigAllEnvs,
    handleSetUpRNConfig,
}

module.exports = Configuration;