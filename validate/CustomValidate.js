const CoreValidation = require('./CoreValidate');
const RegexConst = require('./RegexConstants');

// Core function to check Custom Validation
const commonCustomCheckFunction = ({ validateArr }) => {
  if (!validateArr) {
    return {
      isValidated: true,
      errors: [],
    };
  }
  let isValidated = true;
  let errors = [];
  validateArr.forEach((valItem) => {
    isValidated = isValidated && valItem.isValidated;
    errors = [
      ...errors,
      ...(valItem.isValidated ? [] : valItem.errors),
    ];
  });
  return {
    isValidated,
    errors: isValidated ? [] : errors,
  };
};

const checkTeamsUrl = ({ valueString }) => {
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkRegexSuitable({ valueString, regexTest: RegexConst.urlMatch }),
      CoreValidation.checkNoSpaces({ valueString }),
    ],
  });
  return resultValidate;
};

const checkCertFolderPath = ({ valueString }) => {
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString, excludeSymbolsArr: ['_'] }),
    ],
  });
  return resultValidate;
};

const checkBundleIdentifier = ({ valueString }) => {
  const excludeSymbolsArr = ['.'];
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkPrefix({ valueString, prefix: 'com.amela.' }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkLowercaseAlphabeticOnly({ valueString, excludeSymbolsArr }),
      CoreValidation.checkNoSpecialSymbols({ valueString, excludeSymbolsArr }),
    ],
  });
  return resultValidate;
};

const checkAppCode = ({ valueString }) => {
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkLowercaseAlphabeticOnly({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString }),
    ],
  });
  return resultValidate;
};

const checkProjectName = ({ valueString }) => {
  const excludeSymbolsArr = ['-'];
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkAlphabeticOnly({ valueString, excludeSymbolsArr }),
      CoreValidation.checkNoSpecialSymbols({ valueString, excludeSymbolsArr }),
    ],
  });
  return resultValidate;
};

const checkProjectDisplayName = ({ valueString }) => {
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString }),
    ],
  });
  return resultValidate;
};

const CustomValidation = {
  checkTeamsUrl,
  checkCertFolderPath,
  checkBundleIdentifier,
  checkAppCode,
  checkProjectName,
  checkProjectDisplayName,
};

module.exports = CustomValidation;
