const CustomPromise = require('utils/promises');

const addNewGitRemote = async ({ appName, repoURL }) => {
  const newPath = `./${appName}`;
  if (repoURL) {
    await CustomPromise.execCommandLinePromise(
      `cd ${newPath} && git init && git remote add origin ${repoURL} && git fetch --all`,
    );
  }
};

const pullMaster = async ({ appName, repoURL }) => {
  if (repoURL) {
    await CustomPromise.execCommandLinePromise(
      `cd ${appName} && rm -rf README.md`,
    );
    await CustomPromise.execCommandLinePromise(
      `cd ${appName} && git pull origin master --allow-unrelated-histories`,
    );
  }
};

const Git = {
  addNewGitRemote,
  pullMaster,
};

module.exports = Git;
