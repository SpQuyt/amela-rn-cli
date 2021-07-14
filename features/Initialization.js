const chalk = require("chalk");
const figlet = require("figlet");
const Helpers = require("../helpers");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const { version } = require("../package.json");

const handlePreProcessParams = async () => {
    // Check for update
    const checkUpdateResult = await Helpers.checkUpdate();
    const { notifyType, boxenObj } = checkUpdateResult;
    if (notifyType) {
        console.log(boxenObj);
        return false;
    }
    
    // Check if flag of command line is suitable
    if (Object.keys(argv).length > 2) {
        if (Object.keys(argv).length === 3 && argv.v) {
            console.log(version);
            return;
        }
        console.log(
            chalk.red(
                "Your syntax is not correct! Please try again! \nCorrect flags are:"
            )
        );
        console.log("--version");
        return false;
    }
    return true;
}

const handleDecorateFirstInit = async () => {
    // clear();
    console.log(
        chalk.yellow(figlet.textSync("AMELA", { horizontalLayout: "full" }))
    );
};

const Initialization = {
    handlePreProcessParams,
    handleDecorateFirstInit,
}

module.exports = Initialization;