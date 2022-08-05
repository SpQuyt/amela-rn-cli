/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const chalk = require('chalk');
const CustomPromise = require('utils/promises');
const Texts = require('utils/texts');
const CoreValidation = require('validate/CoreValidate');
const CustomValidation = require('validate/CustomValidate');

const askQuestion1Answer = async ({ question, onValidate }) => {
  const listQuestion = [question];
  const result = await CustomPromise.promptGetListQuestionPromise(
    listQuestion,
  );
  let answer = result[listQuestion[0]];
  if (onValidate) {
    let validateObject = onValidate(answer);
    while (!validateObject.isValidated) {
      validateObject.errors.forEach((errItem) => {
        console.log(
          chalk.red(`\t⮕  ${errItem}`),
        );
      });
      const resultInLoop = await CustomPromise.promptGetListQuestionPromise(
        listQuestion,
      );
      answer = resultInLoop[listQuestion[0]];
      validateObject = onValidate(answer);
    }
  }
  return answer;
};

const askQuestionYesNo = async ({ question }) => {
  const answerObj = await CustomPromise.getRadioButtonAnswerPromise(
    question,
    [Texts.yes, Texts.no],
  );
  const answer = answerObj[question];
  return answer;
};

const askOverrideRepo = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'Folder with same name already existed. Do you want to override it? (y/n)',
      onValidate: (valueString) => CoreValidation.checkYesNo({ valueString }),
    },
  );
  return result;
};

const askOverrideBaseTemplet = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'react-native-templet-v1 already existed! Do you want to remove and reinstall it? (y/n)',
      onValidate: (valueString) => CoreValidation.checkYesNo({ valueString }),
    },
  );
  return result;
};

const askProjectName = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'Project folder name (Alphabetic characters only, no spaces, no special symbols except hyphen "-"). Example: TestProject, test-project: ',
      onValidate: (valueString) => CustomValidation.checkProjectName({ valueString }),
    },
  );
  return result;
};

const askProjectDisplayName = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'Project display name that will be displayed on mobile (No special symbols). Example: Test Project): ',
      onValidate: (valueString) => CustomValidation.checkProjectDisplayName({ valueString }),
    },
  );
  return result;
};

const askAppCode = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'App code for Android keystore (LOWERCASE alphabetic characters only, no spaces, no special symbols") Example: app, acms, test,...: ',
      onValidate: (valueString) => CustomValidation.checkAppCode({ valueString }),
    },
  );
  return result;
};

const askRemoteURL = async () => {
  const result = await askQuestion1Answer(
    { question: 'Remote repository URL (OPTIONAL, you can skip this): ' },
  );
  return result;
};

const askPathToExecuteCLI = async ({ question, defaultPath }) => {
  const result = await askQuestion1Answer(
    { question: `${question} By default, if you don't type anything, ${defaultPath || 'current folder/file'} will be used!` },
  );
  if (!result) {
    return defaultPath || '.';
  }
  return result;
};

const askConfirmInfoOk = async () => {
  const result = await askQuestion1Answer(
    {
      question: 'Are you sure to continue: (y/n): ',
      onValidate: (valueString) => CoreValidation.checkYesNo({ valueString }),
    },
  );
  return result;
};

const askFastlaneConfig = async () => {
  const teams_url = await askQuestion1Answer({
    question: 'Microsoft teams Webhook URL: (Example: https://webhook.com): ',
    onValidate: (valueString) => CustomValidation.checkTeamsUrl({ valueString }),
  });
  const cert_output_folder = await askQuestion1Answer({
    question: 'Folder in Download folder to save certificates (No spaces, no special symbols except "_"). Example: Test_Project_Cert: ',
    onValidate: (valueString) => CustomValidation.checkCertFolderPath({ valueString, excludeSymbolsArr: ['_'] }),
  });
  const app_identifier_dev = await askQuestion1Answer({
    question: 'iOS Bundle ID for DEV environment (Starts with com.amela. No spaces, no special symbols except dots ".") Example: com.amela.test.dev: ',
    onValidate: (valueString) => CustomValidation.checkBundleIdentifier({ valueString }),
  });
  const app_identifier_stg = await askQuestion1Answer({
    question: 'iOS Bundle ID for STAGING environment (Starts with com.amela. No spaces, no special symbols except dots ".") Example: com.amela.test.stg: ',
    onValidate: (valueString) => CustomValidation.checkBundleIdentifier({ valueString }),
  });
  return {
    teams_url,
    cert_output_folder: `~/Downloads/${cert_output_folder}`,
    app_identifier_dev,
    app_identifier_stg,
  };
};

const askSplashConfig = async () => {
  const inputFilePath = await askQuestion1Answer({
    question: 'Image path for splash screen - JPEG, PNG (No spaces, no special symbols except "_", ".", "/") - Example: ./assets/image/splash.jpeg: ',
    onValidate: (valueString) => CustomValidation.checkImageFilePath({ valueString }),
  });
  const backgroundColor = await askQuestion1Answer({
    question: 'Background color for splash screen, (Must be hex-code 6 characters. By default, the color is FFFFFF) - Example: FFFFFF: ',
    onValidate: (valueString) => CustomValidation.checkColorCode({ valueString, defaultValue: 'FFFFFF' }),
  });
  const logoWidth = await askQuestion1Answer({
    question: 'Logo width (Must be a number from 100 to 288. By default the number is 100) - Example: 125: ',
    onValidate: (valueString) => CustomValidation.checkLogoWidth({ valueString, defaultValue: '100' }),
  });
  return {
    inputFilePath,
    backgroundColor,
    logoWidth,
  };
};

const askCodepushConfig = async () => {
  const codepushAppName = await askQuestion1Answer({
    question: 'App name on AppCenter Codepush (No spaces, no special symbols except "-") - Example: testproject, test-project: ',
    onValidate: (valueString) => CustomValidation.checkCodepushAppName({ valueString }),
  });
  return {
    codepushAppName,
  };
};

const askAppCenterApiKey = async () => {
  const apiKey = await askQuestion1Answer({
    question: `Please copy and paste API Key with ${chalk.bold.white('Full Access')} permission.\nIf you don't have any, create one on ${chalk.bold.blue('https://appcenter.ms/settings/apitokens')}: `,
    onValidate: (valueString) => CoreValidation.checkFilled({ valueString }),
  });
  return {
    apiKey,
  };
};

const Questions = {
  askQuestion1Answer,
  askQuestionYesNo,
  askOverrideRepo,
  askOverrideBaseTemplet,
  askProjectName,
  askProjectDisplayName,
  askAppCode,
  askRemoteURL,
  askConfirmInfoOk,
  askFastlaneConfig,
  askPathToExecuteCLI,
  askSplashConfig,
  askCodepushConfig,
  askAppCenterApiKey,
};

module.exports = Questions;
