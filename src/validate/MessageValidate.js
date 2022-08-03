const MessageValidation = {
  // Core Validation
  regexSuitable: (regexTest) => `Not matches regex ${regexTest}`,
  notBlank: () => 'Must not be blank',
  maxLength: (maxLength) => `Max length must be ${maxLength}`,
  minLength: (minLength) => `Min length must be ${minLength}`,
  noSpecialSymbol: ({ excludeSymbolsArr }) => {
    const errorMessage = 'Must not contain any special symbols';
    if (excludeSymbolsArr) {
      const lastPhrase = `except ${excludeSymbolsArr.join(' ')}`;
      return `${errorMessage}, ${lastPhrase}`;
    }
    return errorMessage;
  },
  lowercaseAlphabetOnly: () => 'LOWERCASE alphabetic characters only',
  uppercaseAlphabetOnly: () => 'UPPERCASE alphabetic characters only',
  alphabetOnly: () => 'Alphabetic characters only',
  numericOnly: () => 'Numbers only',
  numberInRange: (max, min) => `Value must be ${min} <= value <= ${max}`,
  confirmYesNo: () => '"y" or "n" only',
  containsPrefix: (prefix) => `Must start with ${prefix}`,
  noSpaces: () => 'No spaces',
  relativePath: () => 'Must have format ./abc/def or ./abc/def/xyz.qwe',
  hexColorCode: () => 'Must have right format ( https://www.pluralsight.com/blog/tutorials/understanding-hexadecimal-colors-simple )',

  // Custom Validation
  teamsUrl: () => 'Not a right formatted URL [starts with http://, https://, ftp://] - [ends with .com, .vn, ...]',
  certOutputFolderPath: () => 'Alphabetic characters only, no spaces, no special symbols except "_"',
  bundleId: () => 'Alphabetic characters only, no spaces, no special symbols except dots "."',
};

module.exports = MessageValidation;
