const Helpers = require('../../helpers');
const CustomPromise = require('../../promises');

const config = async ({ appName }) => {
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName });
  const infoPlistPath = `./${appName}/ios/${appNameWithoutHyphen}/Info.plist`;
  await CustomPromise.replaceStringFilePromise(
    `${infoPlistPath}`,
    '<key>CFBundleDevelopmentRegion</key>\n\t<string>en</string>',
    '<key>CFBundleDevelopmentRegion</key>\n\t<string>ja_JP</string>\n\t<key>CFBundleLocalizations</key>\n\t<array>\n\t\t<string>ja</string>\n\t</array>',
  );
};

const LanguageAndRegion = {
  config,
};

module.exports = LanguageAndRegion;
