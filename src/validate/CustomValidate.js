const CoreValidation = require('validate/CoreValidate');
const RegexConst = require('validate/RegexConstants');

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

const checkImageFilePath = ({ valueString }) => {
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkRegexRelativeFilePath({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString, excludeSymbolsArr: ['_', '.', '/'] }),
    ],
  });
  return resultValidate;
};

const checkColorCode = ({ valueString, defaultValue }) => {
  if (!valueString && !!defaultValue) {
    return {
      isValidated: true,
      errors: [],
    };
  }
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString }),
      CoreValidation.checkRegexHexColorCode({ valueString }),
      CoreValidation.checkLength({ valueString, maxLength: 6, minLength: 6 }),
    ],
  });
  return resultValidate;
};

const checkLogoWidth = ({ valueString, defaultValue }) => {
  if (!valueString && !!defaultValue) {
    return {
      isValidated: true,
      errors: [],
    };
  }
  const resultValidate = commonCustomCheckFunction({
    validateArr: [
      CoreValidation.checkFilled({ valueString }),
      CoreValidation.checkNoSpaces({ valueString }),
      CoreValidation.checkNoSpecialSymbols({ valueString }),
      CoreValidation.checkNumericOnly({ valueString }),
      CoreValidation.checkNumberFitForRange({ valueString, min: 100, max: 288 }),
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
  checkImageFilePath,
  checkColorCode,
  checkLogoWidth,
};

module.exports = CustomValidation;
