const chalk = require('chalk');
const figlet = require('figlet');
const Helpers = require('../helpers');

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

const handleDecorateFirstInit = async (type) => {
  // clear();
  console.log(
    chalk.yellow(figlet.textSync(`AMELA${type ? `-${type.toUpperCase()}` : ''}`, { horizontalLayout: 'full' })),
  );
};

const Display = {
  handlePreProcessParams,
  handleDecorateFirstInit,
};

module.exports = Display;
