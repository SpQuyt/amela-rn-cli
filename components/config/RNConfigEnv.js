/* eslint-disable no-nested-ternary */
const Helpers = require('../../helpers');
const CustomPromise = require('../../promises');

const config = async (
  {
    envTypeFull = 'development',
    appName,
    appDisplayName,
  },
) => {
  const defaultAppId = 'jp.demo.app';
  const appNameWithoutHyphen = Helpers.convertAppNameToWithoutHyphen({ appName, isLowerCase: true });
  // Setup env file
  const envFilePath = `./${appName}/.env.${envTypeFull}`;
  const envTypeShorten = envTypeFull === 'development'
    ? 'dev'
    : envTypeFull === 'staging'
      ? 'stg'
      : 'prod';
  await CustomPromise.replaceStringFilePromise(
    `${envFilePath}`,
    'APP_NAME=Demo Development',
    `APP_NAME=${appDisplayName} ${
      envTypeFull[0].toUpperCase() + envTypeFull.slice(1)
    }`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${envFilePath}`,
    `ANDROID_APP_ID=${defaultAppId}`,
    `ANDROID_APP_ID=com.apps.${appNameWithoutHyphen}.${envTypeShorten}`,
  );
  await CustomPromise.replaceStringFilePromise(
    `${envFilePath}`,
    `IOS_APP_ID=${defaultAppId}`,
    `IOS_APP_ID=com.apps.${appNameWithoutHyphen}.${envTypeShorten}`,
  );
};

const RNConfigEnv = {
  config,
};

module.exports = RNConfigEnv;
