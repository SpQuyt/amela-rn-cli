const RegexConst = {
  urlMatch: /((https?:\/\/|ftp:\/\/|www\.)\S+\.[^()\n ]+((?:\([^)]*\))|[^.,;:?!"'\n)\]<* ])+)/g,
  stringWithoutSpecialSymbols: /^[^`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]*$/g,
  stringContainsAlphabetOnly: /^[a-zA-Z]*$/g,
  stringContainsAlphabetUppercaseOnly: /^[A-Z]*$/g,
  stringContainsAlphabetLowercaseOnly: /^[a-z]*$/g,
  stringWithoutSpaces: /^[^ ]*$/g,
};

module.exports = RegexConst;
