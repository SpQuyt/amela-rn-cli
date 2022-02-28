const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { argv } = yargs(hideBin(process.argv));
const { version } = require('../package.json');
const { ArgvType } = require('../enums');

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
  console.log(`\nUsage: amela-rn-cli <flag>
      
          amela-rn-cli --init         install new project
          amela-rn-cli --icon         change icon of your project (must be inside your project)
          amela-rn-cli --splash       add splash screen to your project (must be inside your project)
          amela-rn-cli --version      check version of your project`);
  return ArgvType.STOP;
};

const Argv = {
  handleCheckFlags,
};

module.exports = Argv;
