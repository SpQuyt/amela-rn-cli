const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));
const { ArgvType } = require('utils/enums');
const Constants = require('utils/constants');

const { version } = Constants.PackageJsonObj;

const handleCheckFlags = async () => {
  // Check if flag of command line is suitable
  if (Object.keys(argv).length === 3 && (argv.v || argv.version)) {
    console.log(version);
    return ArgvType.STOP;
  }
  if (Object.keys(argv).length === 3 && argv.init) {
    return ArgvType.INIT;
  }
  if (Object.keys(argv).length === 3 && argv.icon) {
    return ArgvType.ICON;
  }
  if (Object.keys(argv).length === 3 && argv.splash) {
    return ArgvType.SPLASH;
  }
  if (Object.keys(argv).length === 3 && argv.fastlane) {
    return ArgvType.FASTLANE;
  }
  if (Object.keys(argv).length === 3 && argv.codepush) {
    return ArgvType.CODEPUSH;
  }
  if (Object.keys(argv).length === 3 && argv.onesignal) {
    return ArgvType.ONESIGNAL;
  }
  console.log(`\nUsage: amela-rn-cli <flag>
      
          amela-rn-cli --init         install new project
          amela-rn-cli --icon         change icon of your project (must be inside your project)
          amela-rn-cli --splash       add splash screen to your project (must be inside your project)
          amela-rn-cli --fastlane     install Fastlane to project
          amela-rn-cli --codepush     install AppCenter Codepush to project
          amela-rn-cli --onesignal    setup OneSignal to project
          amela-rn-cli --version      check version of your project`);
  return ArgvType.STOP;
};

const Argv = {
  handleCheckFlags,
};

module.exports = Argv;
