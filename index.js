#!/usr/bin/env node

const { ArgvType } = require('./enums');
const CreateNewProject = require('./features/CreateNewProject');
const ChangeAppIcon = require('./features/ChangeAppIcon');
const Display = require('./components/Display');
const Argv = require('./components/Argv');
const ChangeSplashScreen = require('./features/ChangeSplashScreen');

const main = async () => {
  try {
    // Check pre-conditions and params from command line
    const preProcessBoolean = await Display.handlePreProcessParams();
    if (!preProcessBoolean) return;
    // Check flag suitable
    const checkFlagResult = await Argv.handleCheckFlags();
    if (checkFlagResult === ArgvType.STOP) return;
    // Decorate first cmd line
    await Display.handleDecorateFirstInit(checkFlagResult);
    // Choose mode
    if (checkFlagResult === ArgvType.INIT) {
      await CreateNewProject.exec();
    } else if (checkFlagResult === ArgvType.ICON) {
      await ChangeAppIcon.exec({});
    } else if (checkFlagResult === ArgvType.SPLASH) {
      await ChangeSplashScreen.exec({});
    }
  } catch (err) {
    console.log('err: ', err);
  }
};

main();
