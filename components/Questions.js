/* eslint-disable camelcase */
const CustomPromise = require('../promises');

const askQuestion1Answer = async (question) => {
  const listQuestion = [question];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askOverrideRepo = async () => {
  const result = await askQuestion1Answer(
    'Folder with same name already existed. Do you want to override it? (y/n)',
  );
  return result;
};

const askOverrideBaseTemplet = async () => {
  const result = await askQuestion1Answer(
    'react-native-templet-v1 already existed! Do you want to remove and reinstall it? (y/n)',
  );
  return result;
};

const askProjectName = async () => {
  const result = await askQuestion1Answer(
    'Project name (Folder name and project name in android,ios - example: TestProject): ',
  );
  return result;
};

const askProjectDisplayName = async () => {
  const result = await askQuestion1Answer(
    'Project display name (Name that will be displayed on mobile - example: Test Project): ',
  );
  return result;
};

const askAppCode = async () => {
  const result = await askQuestion1Answer(
    'App code for Android keystore (3 characters - example: app, skn, tag,...): ',
  );
  return result;
};

const askRemoteURL = async () => {
  const result = await askQuestion1Answer(
    'Remote repository URL (OPTIONAL, you can skip this): ',
  );
  return result;
};

const askPathToExecuteCLI = async ({ question, defaultPath }) => {
  const result = await askQuestion1Answer(
    `${question} By default, if you don't type anything, ${defaultPath || 'current folder/file'} will be used!`,
  );
  if (!result) {
    return defaultPath || '.';
  }
  return result;
};

const askConfirmInfoOk = async () => {
  const result = await askQuestion1Answer(
    'Are you sure to continue: (y/n): ',
  );
  return result;
};

const askFastlaneConfig = async () => {
  const teams_url = await askQuestion1Answer('Microsoft teams Webhook URL: (Example: https://webhook.com): ');
  const cert_output_folder = await askQuestion1Answer('Folder in Download folder to save certificates (Example: Test_Project_Cert): ');
  const app_identifier_dev = await askQuestion1Answer('iOS Bundle ID for DEV environment: (Example: com.test.dev): ');
  const app_identifier_stg = await askQuestion1Answer('iOS Bundle ID for STAGING environment: (Example: com.test.stg): ');
  return {
    teams_url,
    cert_output_folder: `~/Downloads/${cert_output_folder}`,
    app_identifier_dev,
    app_identifier_stg,
  };
};

const Questions = {
  askOverrideRepo,
  askOverrideBaseTemplet,
  askProjectName,
  askProjectDisplayName,
  askAppCode,
  askRemoteURL,
  askConfirmInfoOk,
  askFastlaneConfig,
  askPathToExecuteCLI,
};

module.exports = Questions;
