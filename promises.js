const simpleGit = require("simple-git");
const git = simpleGit();
const prompt = require("prompt");
const colors = require("colors/safe");
const { Spinner } = require("clui");
const { exec } = require("child_process");
const fs = require("fs");
const inquirer = require("inquirer");
const Keytool = require("./keytool-utils/keytool");
const Constants = require("./constants");

// import simpleGit from 'simple-git';
// const git = simpleGit();
// import prompt from 'prompt';
// import colors from 'colors/safe';
// import { Spinner } from 'clui';
// import { exec } from 'child_process';
// import fs from 'fs';

const gitClonePromise = async (localPath = undefined) => {
    const gitCloneStatus = new Spinner(
        "Cloning @amela/react-native-templet-v1..."
    );
    return new Promise((resolve, reject) => {
        gitCloneStatus.start();
        git.clone(
            "https://github.com/amela-technology/react-native-templet-v1.git",
            localPath
        )
            .then(() => {
                console.log("\nCloning successfully!");
                resolve(null);
                gitCloneStatus.stop();
            })
            .catch((err) => {
                console.log("Git clone err: ", err);
                reject(err);
                gitCloneStatus.stop();
            });
    });
};

const promptGetListQuestionPromise = async (listQuestions) => {
    return new Promise((resolve, reject) => {
        prompt.message = colors.white("");
        prompt.delimiter = colors.white(":");
        prompt.start();
        prompt.get(listQuestions, function (err, result) {
            if (err) {
                console.log("Prompt questions list err: ", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const execCommandLinePromise = async (
    execString,
    cmdMessage = "Executing command line..."
) => {
    const execCMDStatus = new Spinner(cmdMessage);
    execCMDStatus.start();
    return new Promise((resolve, reject) => {
        exec(execString, (err, stdout, stderr) => {
            stdout && console.log("\nstdout: ", stdout);
            stderr && console.log("stderr: ", stderr);
            if (err) {
                execCMDStatus.stop();
                reject(err);
            } else {
                execCMDStatus.stop();
                resolve(null);
            }
        });
    });
};

const replaceStringFilePromise = async (filePath, oldString, newString) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log("Replace name string err: ", err);
                reject(err);
            } else {
                data = data.toString();
                data = data.replace(oldString, newString);
                fs.writeFile(filePath, data, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // console.log(`Data of file ${filePath} has been changed! \n`);
                        resolve(null);
                    }
                });
            }
        });
    });
};

const createNewFilePromise = async (filePath, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                reject(err);
            } else {
                // console.log(`Data of file ${filePath} has been changed! \n`);
                resolve(null);
            }
        });
    });
};

const readFilePromise = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log("Replace name string err: ", err);
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

const appendFilePromise = async (filePath, content) => {
    return new Promise((resolve, reject) => {
        fs.appendFile(filePath, content, (err) => {
            if (err) {
                console.log("Append file err: ", err);
                reject(err);
            } else {
                resolve(null);
            }
        });
    });
};

const getRadioButtonAnswerPromise = async (question, choices) => {
    const questionsList = [
        {
            type: "rawlist",
            name: question,
            choices,
        },
    ];
    return new Promise((resolve, reject) => {
        inquirer
            .prompt(questionsList)
            .then((answers) => {
                resolve(answers);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const parseXCodeProjectPromise = async (myProj) => {
    return new Promise((resolve, reject) => {
        myProj.parse((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(null);
            }
        });
    });
};

const createKeyStorePromise = async (appCode, envMode = 'staging', debugMode = false) => {
    const alias = `${appCode}-${envMode}-alias`;
    const dname = "CN=" + alias;
    const keypass = Constants.KeyStorePassword;
    const keysize = "2048";
    const keyalg = "RSA";
    const validity = 10000;
    const valid_from = new Date();
    return new Promise((resolve, reject) => {
        const store = Keytool(`${appCode}-${envMode}-key.keystore`, Constants.KeyStorePassword, {
            debug: debugMode,
            storetype: "JCEKS",
        });
        store.genkeypair(
            alias,
            keypass,
            dname,
            validity,
            keysize,
            keyalg,
            null,
            null,
            valid_from,
            function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            }
        );
    });
};

const CustomPromise = {
    gitClonePromise,
    promptGetListQuestionPromise,
    execCommandLinePromise,
    replaceStringFilePromise,
    createNewFilePromise,
    readFilePromise,
    appendFilePromise,
    getRadioButtonAnswerPromise,
    parseXCodeProjectPromise,
    createKeyStorePromise,
};

module.exports = CustomPromise;
