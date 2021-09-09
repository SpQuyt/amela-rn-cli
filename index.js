#!/usr/bin/env node

const Initialization = require("./features/Initialization");
const Installation = require("./features/Installation");
const Configuration = require("./features/Configuration");
const PostInstallation = require("./features/PostInstallation");
const HandleIcon = require("./icon-utils/HandleIcon");
const Texts = require("./texts");
const { ArgvType } = require("./enums");

const createNewProject = async () => {
    // Ask questions before installing
    const askQuestionsObject = await Installation.handleAskFirstQuestions();
    // Install NPM packages
    if (askQuestionsObject) {
        const {
            appName,
            appDisplayName,
            appCode,
            repoURL,
        } = askQuestionsObject;
        const installPackageBoolean = await Installation.handleInstallPackages(
            appName,
            appDisplayName,
            repoURL
        );
        if (!installPackageBoolean) return;

        // Setup React Native config
        await Configuration.handleSetUpRNConfig(
            appName,
            appDisplayName,
            appCode
        );

        // Post setup and installation
        await PostInstallation.handleExec(appName, repoURL);
    }
};

const main = async () => {
    try {
        // Check pre-conditions and params from command line
        const preProcessBoolean = await Initialization.handlePreProcessParams();
        if (!preProcessBoolean) return;
        // Check flag suitable
        const checkFlagResult = await Initialization.handleCheckFlags();
        if (checkFlagResult === ArgvType.STOP) return;
        // Decorate first cmd line
        await Initialization.handleDecorateFirstInit(checkFlagResult);
        // Choose mode
        if (checkFlagResult === ArgvType.INIT) {
            await createNewProject();
        } else if (checkFlagResult === ArgvType.ICON) {
            await HandleIcon.generateAndInstallIcons();
        }
    } catch (err) {
        console.log("err: ", err);
    }
};

main();
