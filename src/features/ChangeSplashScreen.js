const Questions = require('components/Questions');
const fs = require('fs');
const Helpers = require('utils/helpers');
const CustomPromise = require('utils/promises');
const xcode = require('xcode-utils/pbxProject');

const exec = async () => {
  // Ask for inputPath & backgroundColor
  const { inputFilePath, backgroundColor, logoWidth } = await Questions.askSplashConfig();
  // Get folder app name
  const currentAppName = Helpers.getIosAppNameFolderFromRootFolder();

  /** Android */
  // build.gradle
  await CustomPromise.replaceStringFilePromise(
    './android/build.gradle',
    /compileSdkVersion = \d./,
    'compileSdkVersion = 31',
  );
  await CustomPromise.replaceStringFilePromise(
    './android/build.gradle',
    /targetSdkVersion = \d./,
    'targetSdkVersion = 31',
  );
  // app/build.gradle
  const appBuildGradleReadFile = await CustomPromise.readFilePromise('./android/app/build.gradle');
  if (!appBuildGradleReadFile.includes('core-splashscreen')) {
    await CustomPromise.replaceStringFilePromise(
      './android/app/build.gradle',
      'implementation "com.facebook.react:react-native:+"  // From node_modules',
      'implementation "com.facebook.react:react-native:+"  // From node_modules\n\n    implementation "androidx.core:core-splashscreen:1.0.0-beta01"',
    );
  }
  // AndroidManifest
  const androidManifestReadFile = await CustomPromise.readFilePromise('./android/app/src/main/AndroidManifest.xml');
  if (!androidManifestReadFile.includes('@style/BootTheme')) {
    await CustomPromise.replaceStringFilePromise(
      './android/app/src/main/AndroidManifest.xml',
      'android:theme="@style/AppTheme"',
      'android:theme="@style/BootTheme"',
    );
  }
  if (!androidManifestReadFile.includes('android:exported="true"')) {
    await CustomPromise.replaceStringFilePromise(
      './android/app/src/main/AndroidManifest.xml',
      'android:windowSoftInputMode="adjustResize"',
      'android:windowSoftInputMode="adjustResize"\n          android:exported="true"',
    );
  }
  // MainActivity
  const androidMainActivityReadFile = await CustomPromise.readFilePromise(`./android/app/src/main/java/com/${currentAppName}/MainActivity.java`);
  if (!androidMainActivityReadFile.includes('RNBootSplash')) {
    await CustomPromise.replaceStringFilePromise(
      `./android/app/src/main/java/com/${currentAppName}/MainActivity.java`,
      'import com.facebook.react.ReactActivity;',
      'import com.facebook.react.ReactActivity;\nimport com.zoontek.rnbootsplash.RNBootSplash;\n',
    );
    // For older version
    if (!androidMainActivityReadFile.includes('createReactActivityDelegate')) {
      await CustomPromise.replaceStringFilePromise(
        `./android/app/src/main/java/com/${currentAppName}/MainActivity.java`,
        'public class MainActivity extends ReactActivity {',
        'public class MainActivity extends ReactActivity {\n  @Override\n  protected ReactActivityDelegate createReactActivityDelegate() {\n    return new ReactActivityDelegate(this, getMainComponentName()) {\n\n      @Override\n      protected void loadApp(String appKey) {\n        RNBootSplash.init(MainActivity.this); // <- initialize the splash screen\n        super.loadApp(appKey);\n      }\n    };\n  }',
      );
    } else {
      await CustomPromise.replaceStringFilePromise(
        `./android/app/src/main/java/com/${currentAppName}/MainActivity.java`,
        'return new MainActivityDelegate(this, getMainComponentName());',
        'return new MainActivityDelegate(this, getMainComponentName()) {\n      @Override\n      protected void loadApp(String appKey) {\n        RNBootSplash.init(MainActivity.this); // <- initialize the splash screen\n        super.loadApp(appKey);\n      }\n    };',
      );
    }
  }

  // styles.xml
  const androidStylesReadFile = await CustomPromise.readFilePromise('./android/app/src/main/res/values/styles.xml');
  if (!androidStylesReadFile.includes('BootTheme')) {
    await CustomPromise.replaceStringFilePromise(
      './android/app/src/main/res/values/styles.xml',
      '</resources>',
      '<!-- BootTheme should inherit from Theme.SplashScreen -->\n    <style name="BootTheme" parent="Theme.SplashScreen">\n        <item name="windowSplashScreenBackground">@color/bootsplash_background</item>\n        <item name="windowSplashScreenAnimatedIcon">@mipmap/bootsplash_logo</item>\n        <item name="postSplashScreenTheme">@style/AppTheme</item>\n    </style>\n\n  </resources>',
    );
  }

  /** iOS */
  // Podfile
  await CustomPromise.replaceStringFilePromise(
    './ios/Podfile',
    /platform :ios, .*/,
    'platform :ios, \'11.0\'',
  );
  // AppDelegate
  const iosAppDelegateReadFile = await CustomPromise.readFilePromise(`./ios/${currentAppName}/AppDelegate.mm`);
  if (!iosAppDelegateReadFile.includes('RNBootSplash')) {
    if (fs.existsSync(`./ios/${currentAppName}/AppDelegate.mm`)) {
      await CustomPromise.replaceStringFilePromise(
        `./ios/${currentAppName}/AppDelegate.mm`,
        '#import <React/RCTRootView.h>',
        '#import <React/RCTRootView.h>\n#import "RNBootSplash.h"',
      );
      await CustomPromise.replaceStringFilePromise(
        `./ios/${currentAppName}/AppDelegate.mm`,
        '[self.window makeKeyAndVisible];',
        '[self.window makeKeyAndVisible];\n[RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];',
      );
    }
    // For older version
    if (fs.existsSync(`./ios/${currentAppName}/AppDelegate.m`)) {
      await CustomPromise.replaceStringFilePromise(
        `./ios/${currentAppName}/AppDelegate.m`,
        '#import <React/RCTRootView.h>',
        '#import <React/RCTRootView.h>\n#import "RNBootSplash.h"',
      );
      await CustomPromise.replaceStringFilePromise(
        `./ios/${currentAppName}/AppDelegate.m`,
        '[self.window makeKeyAndVisible];',
        '[self.window makeKeyAndVisible];\n[RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];',
      );
    }
  }
  // Info.plist
  await CustomPromise.replaceStringFilePromise(
    `./ios/${currentAppName}/Info.plist`,
    '<string>LaunchScreen</string>',
    '<string>BootSplash</string>',
  );

  /** npm install */
  await CustomPromise.execCommandLinePromise(
    'yarn add react-native-bootsplash',
    'Installing bootsplash...',
  );
  await CustomPromise.execCommandLinePromise(
    `yarn react-native generate-bootsplash ${inputFilePath} --background-color=${backgroundColor} --logo-width ${logoWidth}`,
    'Generating bootsplash...',
  );

  /** Add code line to .tsx files */
  const rootSceneReadFile = await CustomPromise.readFilePromise('./src/navigation/scene/RootScenes.tsx');
  if (!rootSceneReadFile.includes('RNBootSplash')) {
    await CustomPromise.replaceStringFilePromise(
      './src/navigation/scene/RootScenes.tsx',
      '\nconst Navigation: React.FunctionComponent = () => {',
      'import RNBootSplash from \'react-native-bootsplash\';\n\nconst Navigation: React.FunctionComponent = () => {\n RNBootSplash.hide();',
    );
  }

  /** Link project.pbxproj */
  // Get all information fields
  const pbxProjectPath = `./ios/${currentAppName}.xcodeproj/project.pbxproj`;
  const bootSplashStoryBoardPath = `./ios/${currentAppName}/BootSplash.storyboard`;
  const myProj = xcode(pbxProjectPath);
  await CustomPromise.parseXCodeProjectPromise(myProj);
  const resourceFile = await myProj.addResourceFile(
    bootSplashStoryBoardPath,
    {},
    'Resources',
  );
  const resourceFileProcessed = await JSON.parse(
    JSON.stringify(resourceFile),
  );
  const { uuid, fileRef } = resourceFileProcessed;
  fs.writeFileSync(pbxProjectPath, myProj.writeSync());
  // PBXProject file
  await CustomPromise.replaceStringFilePromise(
    `${pbxProjectPath}`,
    `/* BootSplash.storyboard */ = {isa = PBXFileReference; name = "BootSplash.storyboard"; path = "./ios/${currentAppName}/BootSplash.storyboard"; sourceTree = "<group>"; fileEncoding = undefined; lastKnownFileType = unknown; explicitFileType = undefined; includeInIndex = 0; };`,
    `/* BootSplash.storyboard */ = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = file.storyboard; name = BootSplash.storyboard; path = ${currentAppName}/BootSplash.storyboard; sourceTree = "<group>"; };`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${pbxProjectPath}`,
    `13B07FAE1A68108700A75B9A /* ${currentAppName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (`,
    `13B07FAE1A68108700A75B9A /* ${currentAppName} */ = {\n\t\t\tisa = PBXGroup;\n\t\t\tchildren = (\n\t\t\t\t${fileRef} /* BootSplash.storyboard */,`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${pbxProjectPath}`,
    '13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,',
    `13B07F8E1A680F5B00A75B9A /* Resources */ = {\n\t\t\tisa = PBXResourcesBuildPhase;\n\t\t\tbuildActionMask = 2147483647;\n\t\t\tfiles = (\n\t\t\t\t81AB9BB82411601600AC10FF /* LaunchScreen.storyboard in Resources */,\n\t\t\t\t${uuid} /* BootSplash.storyboard in Resources */,`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${pbxProjectPath}`,
    '{\n\t\t\t\t\tvalue = 78570A06BE1A4B96B4F1D407;\n\t\t\t\t\tcomment = ;\n\t\t\t\t}',
    '78570A06BE1A4B96B4F1D407 /*   */',
  );
};

const ChangeSplashScreen = {
  exec,
};

module.exports = ChangeSplashScreen;
