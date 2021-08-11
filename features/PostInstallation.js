const HandleIcon = require("../icon-utils/HandleIcon");
const CustomPromise = require("../promises");
const Texts = require("../texts");

const isWinOS = process.platform === "win32";

const handleRunSimulatorIOS = async (appName) => {
    await CustomPromise.execCommandLinePromise(
        `cd ./${appName} && npx react-native run-ios`,
        `Running iOS...`
    );
};

const handleExec = async (appName, repoURL) => {
    // Delete README to avoid conflict and then pull master
    if (repoURL) {
        await CustomPromise.execCommandLinePromise(
            `cd ${appName} && rm -rf README.md`
        );
        await CustomPromise.execCommandLinePromise(
            `cd ${appName} && git pull origin master --allow-unrelated-histories`
        );
    }
    // Change app icon to default AMELA icon
    const appNameWithoutHyphen = `${appName.trim().replace(/-/g, "").replace(/ /g, "")}`;
    await HandleIcon.generateAndInstallIcons(appNameWithoutHyphen, appName);

    if (!isWinOS) {
        // Ask user what to do next
        console.log("Installation completed!");
        const postInstallQuestion = "What do you want to do next?";
        const postInstallAnswerObj = await CustomPromise.getRadioButtonAnswerPromise(
            postInstallQuestion,
            [Texts.runOnIOSSimulator, Texts.nothing]
        );
        const postInstallAnswer = postInstallAnswerObj[postInstallQuestion];
        // Running on device iOS
        if (postInstallAnswer === Texts.runOnIOSSimulator) {
            await handleRunSimulatorIOS(appName);
        }
    }
};

const PostInstallation = {
    handleExec,
}

module.exports = PostInstallation;