const Helpers = require('utils/helpers');
const MessageValidation = require('validate/MessageValidate');
const RegexConst = require('validate/RegexConstants');

// Core Regex checking function
const checkRegexSuitable = ({ valueString, regexTest }) => {
  if (!valueString) {
    return {
      isValidated: false,
      errors: [MessageValidation.regexSuitable(regexTest)],
    };
  }
  const isValidated = !!valueString.match(regexTest);
  return {
    isValidated,
    errors: isValidated ? [] : [MessageValidation.regexSuitable(regexTest)],
  };
};

// Core checking function, only change params
const commonCoreCheckFunction = ({
  valueString, errors, regexTest, excludeSymbolsArr, validateFunc,
}) => {
  if (!valueString) {
    return {
      isValidated: false,
      errors,
    };
  }
  const valueStringExcludeSymbol = Helpers.cutOffExcludedSymbolsFromString({
    valueString,
    excludeSymbolsArr,
  });
  const { isValidated } = validateFunc
    ? validateFunc()
    : checkRegexSuitable({
      valueString: valueStringExcludeSymbol,
      regexTest,
    });
  return {
    isValidated,
    errors: isValidated ? [] : errors,
  };
};

const checkFilled = ({ valueString }) => {
  const isValidated = !!valueString && valueString.trim().length > 0;
  return {
    isValidated,
    errors: isValidated ? [] : [MessageValidation.notBlank()],
  };
};

const checkLength = ({ valueString, maxLength, minLength }) => {
  if (!!maxLength && !!minLength) {
    const isValidated = valueString.length >= minLength && valueString.length <= maxLength;
    return {
      isValidated,
      errors: isValidated ? [] : [MessageValidation.maxLength(maxLength), MessageValidation.minLength(minLength)],
    };
  }
  if (maxLength && !minLength) {
    const isValidated = valueString.length <= maxLength;
    return {
      isValidated,
      errors: isValidated ? [] : [MessageValidation.maxLength(maxLength)],
    };
  }
  const isValidated = valueString.length >= minLength;
  return {
    isValidated,
    errors: isValidated ? [] : [MessageValidation.minLength(minLength)],
  };
};

const checkNoSpecialSymbols = ({ valueString, excludeSymbolsArr }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.noSpecialSymbol({ excludeSymbolsArr })],
    excludeSymbolsArr,
    regexTest: RegexConst.stringWithoutSpecialSymbols,
  });
  return resultValidate;
};

const checkLowercaseAlphabeticOnly = ({ valueString, excludeSymbolsArr }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.lowercaseAlphabetOnly()],
    excludeSymbolsArr,
    regexTest: RegexConst.stringContainsAlphabetLowercaseOnly,
  });
  return resultValidate;
};

const checkUppercaseAlphabeticOnly = ({ valueString, excludeSymbolsArr }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.uppercaseAlphabetOnly()],
    excludeSymbolsArr,
    regexTest: RegexConst.stringContainsAlphabetUppercaseOnly,
  });
  return resultValidate;
};

const checkAlphabeticOnly = ({ valueString, excludeSymbolsArr }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.alphabetOnly()],
    excludeSymbolsArr,
    regexTest: RegexConst.stringContainsAlphabetOnly,
  });
  return resultValidate;
};

const checkNoSpaces = ({ valueString }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.noSpaces()],
    regexTest: RegexConst.stringWithoutSpaces,
  });
  return resultValidate;
};

const checkPrefix = ({ valueString, prefix }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.containsPrefix(prefix)],
    validateFunc: () => ({
      isValidated: valueString.indexOf(prefix) === 0,
    }),
  });
  return resultValidate;
};

const checkYesNo = ({ valueString }) => {
  const resultValidate = commonCoreCheckFunction({
    valueString,
    errors: [MessageValidation.confirmYesNo()],
    validateFunc: () => ({
      isValidated: valueString === 'Y' || valueString === 'y' || valueString === 'N' || valueString === 'n',
    }),
  });
  return resultValidate;
};

const CoreValidation = {
  checkRegexSuitable,
  checkFilled,
  checkLength,
  checkNoSpecialSymbols,
  checkLowercaseAlphabeticOnly,
  checkUppercaseAlphabeticOnly,
  checkAlphabeticOnly,
  checkYesNo,
  checkPrefix,
  checkNoSpaces,
};

module.exports = CoreValidation;
