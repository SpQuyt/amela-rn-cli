const RegexConst = {
  urlMatch: /((https?:\/\/|ftp:\/\/|www\.)\S+\.[^()\n ]+((?:\([^)]*\))|[^.,;:?!"'\n)\]<* ])+)/g,
  stringWithoutSpecialSymbols: /^[^`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]*$/g,
  stringContainsAlphabetOnly: /^[a-zA-Z]*$/g,
  stringContainsAlphabetUppercaseOnly: /^[A-Z]*$/g,
  stringContainsAlphabetLowercaseOnly: /^[a-z]*$/g,
  stringWithoutSpaces: /^[^ ]*$/g,
  stringContainsNumericOnly: /^[0-9]*$/g,
  filePathMatch: /^(.+)\/([^/]+)$/g,
  hexColorMatch: /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/g,
};

module.exports = RegexConst;
