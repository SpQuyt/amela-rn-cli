const CustomPromise = require("../promises");

const isWinOS = process.platform === "win32";

const handleRunSimulatorIOS = async (appName) => {
    await CustomPromise.execCommandLinePromise(
        `cd ./${appName} && npx react-native run-ios`,
        `Running iOS...`
    );
};

const handleExec = async (appName) => {
    if (!isWinOS) {    
        // Ask user what to do next
        console.log("Installation completed!");
        const postInstallQuestion = "What do you want to do next?";
        const postInstallAnswerObj = await CustomPromise.getRadioButtonAnswerPromise(
            postInstallQuestion,
            ["Run on iOS simulator", "Nothing"]
        );
        const postInstallAnswer = postInstallAnswerObj[postInstallQuestion];
        // Running on device iOS
        if (postInstallAnswer === "Run on iOS simulator") {
            await handleRunSimulatorIOS(appName);
        }
    }
};

const PostInstallation = {
    handleExec,
}

module.exports = PostInstallation;