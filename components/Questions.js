const CustomPromise = require('../promises');

const askOverrideRepo = async () => {
  const listQuestion = [
    'Folder with same name already existed. Do you want to override it? (y/n)',
  ];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askOverrideBaseTemplet = async () => {
  const listQuestion = [
    'react-native-templet-v1 already existed! Do you want to remove and reinstall it? (y/n)',
  ];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askProjectName = async () => {
  const listQuestion = ['Project name (Folder name and project name in android,ios - example: TestProject): '];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askProjectDisplayName = async () => {
  const listQuestion = ['Project display name (Name that will be displayed on mobile - example: Test Project): '];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askAppCode = async () => {
  const listQuestion = ['App code for Android keystore (3 characters - example: app, skn, tag,...): '];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askRemoteURL = async () => {
  const listQuestion = ['Remote repository URL (OPTIONAL, you can skip this): '];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const askConfirmInfoOk = async () => {
  const listQuestion = ['Are you sure to continue: (y/n): '];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  return result[listQuestion[0]];
};

const Questions = {
  askOverrideRepo,
  askOverrideBaseTemplet,
  askProjectName,
  askProjectDisplayName,
  askAppCode,
  askRemoteURL,
  askConfirmInfoOk,
};

module.exports = Questions;
