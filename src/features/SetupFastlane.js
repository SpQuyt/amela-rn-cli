/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const Questions = require('components/Questions');
const CustomPromise = require('utils/promises');
const GemFileString = require('fastlane-utils/GemfileString');
const PluginFileString = require('fastlane-utils/PluginfileString');
const FastFileString = require('fastlane-utils/FastfileString');
const Helpers = require('utils/helpers');
require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const exec = async (appNameWithoutHyphen) => {
  // Check if the environment is DEV, then read from env.development file
  const ios_app_folder_name = process.env.IOS_APP_FOLDER_NAME || Helpers.getIosAppNameFolderFromRootFolder();
  const {
    teams_url, cert_output_folder,
    app_identifier_dev, app_identifier_stg,
  } = process.env.CERT_OUTPUT_FOLDER && process.env.TEAMS_URL && process.env.APP_IDENTIFIER_DEV && process.env.APP_IDENTIFIER_STG
    ? {
      teams_url: process.env.TEAMS_URL,
      cert_output_folder: process.env.CERT_OUTPUT_FOLDER,
      app_identifier_dev: process.env.APP_IDENTIFIER_DEV,
      app_identifier_stg: process.env.APP_IDENTIFIER_STG,
    }
    : await Questions.askFastlaneConfig();

  // Get current project folder path
  // If already defined in param of function, use that param
  const folderToExec = appNameWithoutHyphen || await Questions.askPathToExecuteCLI({
    question: 'Folder path to install fastlane files? (Example: ./ios/fastlane/)',
  });

  // Delete and recreate folders
  await CustomPromise.execCommandLinePromise(
    `rm -rf ${folderToExec}/fastlane && rm -rf ${folderToExec}/Gemfile && mkdir ${folderToExec}/fastlane`,
    'Making folder icon AppIcon.appiconset...',
  );

  // Creating fastlane files
  await CustomPromise.createNewFilePromise(
    `${folderToExec}/Gemfile`,
    GemFileString,
  );
  await CustomPromise.createNewFilePromise(
    `${folderToExec}/fastlane/Pluginfile`,
    PluginFileString,
  );
  await CustomPromise.createNewFilePromise(
    `${folderToExec}/fastlane/Fastfile`,
    FastFileString.replace(/teams_url = \"\"/g, `teams_url = \"${teams_url}\"`)
      .replace(/cert_output_folder = \"\"/g, `cert_output_folder = \"${cert_output_folder}\"`)
      .replace(/ios_app_folder_name = \"\"/g, `ios_app_folder_name = \"${ios_app_folder_name}\"`)
      .replace(/app_identifier_dev = \"\"/g, `app_identifier_dev = \"${app_identifier_dev}\"`)
      .replace(/app_identifier_stg = \"\"/g, `app_identifier_stg = \"${app_identifier_stg}\"`),
  );
  console.log('Done setting up Fastlane!');
};

const SetupFastlane = {
  exec,
};

module.exports = SetupFastlane;
