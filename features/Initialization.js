const chalk = require('chalk');
const figlet = require('figlet');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Helpers = require('../helpers');

const { argv } = yargs(hideBin(process.argv));
const { version } = require('../package.json');
const { ArgvType } = require('../enums');

const handlePreProcessParams = async () => {
  // Check for update
  const checkUpdateResult = await Helpers.checkUpdate();
  const { notifyType, boxenObj } = checkUpdateResult;
  if (notifyType) {
    console.log(boxenObj);
    return false;
  }
  return true;
};

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
  console.log(`\nUsage: amela-rn-cli <flag>
    
        amela-rn-cli --init         install new project
        amela-rn-cli --icon         change icon of your project (must be inside your project)
        amela-rn-cli --version      check version of your project`);
  return ArgvType.STOP;
};

const handleDecorateFirstInit = async (type) => {
  // clear();
  console.log(
    chalk.yellow(figlet.textSync(`AMELA${type ? `-${type.toUpperCase()}` : ''}`, { horizontalLayout: 'full' })),
  );
};

const Initialization = {
  handlePreProcessParams,
  handleDecorateFirstInit,
  handleCheckFlags,
};

module.exports = Initialization;
