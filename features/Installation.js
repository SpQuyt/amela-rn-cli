const chalk = require("chalk");
const fs = require("fs");
const CustomPromise = require("../promises");
const Constants = require("../constants");

const listQuestions = ["Project name", "Project display name"];
const isWinOS = process.platform === "win32";
const currPath = "./react-native-templet-v1";

const editFiles = async (appName, appDisplayName) => {
    const newPath = `./${appName}`;
    // Change app name and display name
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/app.json`,
        '"name": "DemoApp"',
        `\"name\": \"${appName.trim().replace(/-/g, "").replace(/ /g, "")}\"`
    );
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/app.json`,
        '"displayName": "Demo App"',
        `\"displayName\": \"${appDisplayName}\"`
    );
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/package.json`,
        '"name": "DemoApp"',
        `\"name\": \"${appName.trim().replace(/-/g, "").replace(/ /g, "")}\"`
    );
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/.gitignore`,
        "android",
        ""
    );
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/.gitignore`,
        "ios",
        ""
    );
    // Handle script postinstall
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/package.json`,
        '"postinstall": "cd scripts && sh ./fix-lib.sh && cd .. && cd ios && pod install && cd .. && npx jetifier",',
        ""
    );
    await CustomPromise.execCommandLinePromise(
        `cd ./${appName} && yarn && npx react-native eject`,
        `Installing libraries to ${newPath}...`
    );
    await CustomPromise.execCommandLinePromise(
        `cd ./${appName} && npx jetifier`,
        `Jetifier installing for Android to ${newPath}...`
    );
    await CustomPromise.replaceStringFilePromise(
        `${newPath}/package.json`,
        '"pod-install": "cd ios && pod install",',
        `\"pod-install\": \"cd ios && pod install\",\n\"postinstall\": \"cd scripts && sh ./fix-lib.sh ${
            isWinOS ? "" : "&& cd .. && cd ios && pod install && cd .."
        } && npx jetifier\",`
    );
    // Apply fix script sh
    await CustomPromise.execCommandLinePromise(
        `cd ./${appName} && cd scripts && sh ./fix-lib.sh`,
        `Applying script to ${newPath}...`
    );

    if (!isWinOS) {
        // Pod repo update
        await CustomPromise.execCommandLinePromise(
            `pod repo update`,
            `Pod repo updating...`
        );
        await CustomPromise.execCommandLinePromise(
            `cd ./${appName} && cd ios && pod install`,
            `Pod installing for iOS to ${newPath}...`
        );

        // Fix bug useFlipper
        await CustomPromise.replaceStringFilePromise(
            `${newPath}/ios/Podfile`,
            "use_flipper!()",
            "use_flipper!({ 'Flipper-Folly' => '2.5.3', 'Flipper' => '0.87.0', 'Flipper-RSocket' => '1.3.1' })"
        );
        await CustomPromise.replaceStringFilePromise(
            `${newPath}/ios/Podfile`,
            "react_native_post_install(installer)",
            "flipper_post_install(installer)"
        );
        await CustomPromise.execCommandLinePromise(
            `cd ./${appName} && cd ios && pod install`,
            `Update flipper iOS to ${newPath}...`
        );

        // Fix react-native-permissions error handler
        await CustomPromise.replaceStringFilePromise(
            `${newPath}/ios/Podfile`,
            "config = use_native_modules!",
            Constants.locationWhenInUseString
        );
        await CustomPromise.execCommandLinePromise(
            `cd ./${appName} && cd ios && pod install`,
            `Update react-native-permissions iOS to ${newPath}...`
        );

        // Add workspace check plist
        await CustomPromise.execCommandLinePromise(
            `cd ./${appName}/ios/${appName.trim().replace(/-/g, "").replace(/ /g, "")}.xcworkspace && mkdir xcshareddata`,
            `Making folder xcshareddata...`
        );
        await CustomPromise.createNewFilePromise(
            `./${appName}/ios/${appName.trim().replace(/-/g, "").replace(/ /g, "")}.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist`,
            Constants.IDEWorkspaceString
        );
    } else {
        console.log(
            chalk.red(
                "Sorry! WindowsOS has not been fully supported yet. Please change to MacOS!"
            )
        );
    }
};

const handleAskFirstQuestions = async () => {
    // Check if user want to override react-native-templet-v1
    if (fs.existsSync(currPath)) {
        const listQuestionsConfirmRemove = [
            "react-native-templet-v1 already existed! Do you want to remove and reinstall it? (y/n)",
        ];
        const resultConfirmRemove = await CustomPromise.promptGetListQuestionPromise(
            listQuestionsConfirmRemove
        );
        if (
            resultConfirmRemove[listQuestionsConfirmRemove[0]]
                .toString()
                .trim()
                .toLowerCase() === "y"
        ) {
            await CustomPromise.execCommandLinePromise(
                `rm -r ${currPath.replace("./", "")}`,
                `Removing folder ${currPath}...`
            );
        } else {
            return undefined;
        }
    }

    // Ask questions to get information
    const resultQuestions = await CustomPromise.promptGetListQuestionPromise(
        listQuestions,
    );
    const listQuestionsAppCode = ["App code for Android keystore (3 characters - example: app, skn, tag,...): "];
    const resultAppCode = await CustomPromise.promptGetListQuestionPromise(
        listQuestionsAppCode,
    );
    const listQuestionsRemoteURL = ["Remote repository URL (OPTIONAL, you can skip this): "];
    const resultRemoteURL = await CustomPromise.promptGetListQuestionPromise(
        listQuestionsRemoteURL,
    );
    const appCode = resultAppCode[listQuestionsAppCode[0]].trim();
    const appName = resultQuestions[listQuestions[0]].trim().replace(/ /g, "");
    const appDisplayName = resultQuestions[listQuestions[1]].trim().replace(/'|"|@/g, "");
    const repoURL = resultRemoteURL[listQuestionsRemoteURL[0]].trim();
    console.log(`FolderName: ${appName}`);
    console.log(`AppName: ${appName.trim().replace(/-/g, "")}`);
    console.log(`AppDisplayName: ${appDisplayName}`);
    console.log(`AppCode: ${appCode}`);
    console.log(`Repo URL: ${repoURL}`);
    return {
        appCode,
        appName,
        appDisplayName,
        repoURL,
    }
}

const addNewGitRemote = async (appName, repoURL) => {
    const newPath = `./${appName}`;
    await CustomPromise.execCommandLinePromise(
        `cd ${newPath} && git init && git remote add origin ${repoURL} && git fetch --all`
    );
}

const handleInstallPackages = async (appName, appDisplayName, repoURL) => {
    const newPath = `./${appName}`;

    if (!fs.existsSync(newPath)) {
        await CustomPromise.gitClonePromise();
        await CustomPromise.execCommandLinePromise(
            `cd ${currPath} && rm -rf .git`
        );
        fs.renameSync(currPath, newPath);
        if (repoURL) {
            await addNewGitRemote(appName, repoURL);
        }
        await editFiles(appName, appDisplayName);
        return true;
    }
    if (fs.existsSync(newPath)) {
        const listQuestionsOverrideRepo = [
            "Folder with same name already existed. Do you want to override it? (y/n)",
        ];
        const resultOverrideRepo = await CustomPromise.promptGetListQuestionPromise(
            listQuestionsOverrideRepo
        );
        if (
            resultOverrideRepo[listQuestionsOverrideRepo[0]]
                .toString()
                .trim()
                .toLowerCase() === "y"
        ) {
            await CustomPromise.gitClonePromise();
            await CustomPromise.execCommandLinePromise(
                `cd ${currPath} && rm -rf .git`
            );
            await CustomPromise.execCommandLinePromise(
                `cp -a ${currPath}/. ${newPath}/`,
                `Copying folder ${currPath} to ${newPath}...`
            );
            await CustomPromise.execCommandLinePromise(
                `rm -r ${currPath.replace("./", "")}`,
                `Removing folder ${currPath}...`
            );
            if (repoURL) {
                await addNewGitRemote(appName, repoURL);
            }
            await editFiles(appName, appDisplayName);
            return true;
        }
        return false;
    }
    return true;
};

const Installation = {
    handleAskFirstQuestions,
    handleInstallPackages,
}

module.exports = Installation;