const Helpers = require('../../helpers');
const CustomPromise = require('../../promises');

const config = async ({ appName }) => {
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName, isLowerCase: true });
  const mainActivityPath = `./${appName}/android/app/src/main/java/com/${appNameWithoutHyphen}/MainActivity.java`;
  await CustomPromise.replaceStringFilePromise(
    mainActivityPath,
    `@Override\n  protected String getMainComponentName() {\n    return "${appName}";\n  }`,
    `@Override\n  protected String getMainComponentName() {\n    return "${appName}";\n  }\n  @Override\n  protected ReactActivityDelegate createReactActivityDelegate() {\n    return new ReactActivityDelegate(this, getMainComponentName()) {\n      @Override\n      protected ReactRootView createRootView() {\n        return new RNGestureHandlerEnabledRootView(MainActivity.this);\n      }\n    };\n  }`,
  );
  await CustomPromise.replaceStringFilePromise(
    mainActivityPath,
    'import com.facebook.react.ReactActivity;',
    'import com.facebook.react.ReactActivity;\nimport com.facebook.react.ReactActivityDelegate;\nimport com.facebook.react.ReactRootView;\nimport com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;',
  );
};

const Modalize = {
  config,
};

module.exports = Modalize;
