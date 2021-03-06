import fs from 'fs';
import {execSync} from 'child_process';
import {mkdirsSync, outputFileSync} from 'fs-extra';
import _ from 'lodash';
import {logger} from '../logger';

function createDir(path) {
  mkdirsSync(path);

  let displayPath = path.replace(/^\.\//, '')
                        .replace(/$/, '/');
  logger.create(displayPath);
}

function getFileContent(templatePath, templateVariables) {
  let templateContent = fs.readFileSync(templatePath);

  if (templateVariables) {
    return _.template(templateContent)(templateVariables);
  } else {
    return templateContent;
  }
}

function createFile(templatePath, targetPath, templateVariables) {
  let fileContent = getFileContent(templatePath, templateVariables);
  outputFileSync(targetPath, fileContent);

  let displayPath = targetPath.replace(/^\.\//, '');
  logger.create(displayPath);
}

function executeCommand(cmd, options) {
  logger.run(cmd);
  execSync(cmd, options);
}

function createMeteorApp(appName) {
  let appPath = `./${appName}`;

  try {
    executeCommand(`meteor create ${appName} --release 1.3-beta.11`);
  } catch(e) {
    logger.error(`Failed to create ${appName}`);
    process.exit(1);
  }
  execSync('rm *.css *.html *.js', {cwd: appPath});
  execSync(`echo 'kadira:flow-router' >> ${appPath}/.meteor/packages`);
  execSync(`echo 'aldeed:collection2' >> ${appPath}/.meteor/packages`);
}

export default function create(appName) {
  if (process.env.NODE_ENV !== 'test') {
    createMeteorApp(appName);
  }

  createDir(`./${appName}`);
  createFile(`${__dirname}/../../templates/client/configs/context.js`,
           `./${appName}/client/configs/context.js`);
  createFile(`${__dirname}/../../templates/client/main.js`,
           `./${appName}/client/main.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/index.js`,
           `./${appName}/client/modules/core/index.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/routes.jsx`,
           `./${appName}/client/modules/core/routes.jsx`);
  createDir(`./${appName}/client/modules/core/containers`);
  createDir(`./${appName}/client/modules/core/configs`);
  createFile(`${__dirname}/../../templates/client/modules/core/actions/index.js`,
           `./${appName}/client/modules/core/actions/index.js`);
  createFile(`${__dirname}/../../templates/client/modules/core/components/main_layout.jsx`,
           `./${appName}/client/modules/core/components/main_layout.jsx`);
  createFile(`${__dirname}/../../templates/client/modules/core/components/home.jsx`,
           `./${appName}/client/modules/core/components/home.jsx`);

  createFile(`${__dirname}/../../templates/lib/collections/index.js`,
           `./${appName}/lib/collections/index.js`);

  createDir(`./${appName}/server/configs`);
  createFile(`${__dirname}/../../templates/server/main.js`,
           `./${appName}/server/main.js`);
  createFile(`${__dirname}/../../templates/server/methods/index.js`,
           `./${appName}/server/methods/index.js`);
  createFile(`${__dirname}/../../templates/server/publications/index.js`,
           `./${appName}/server/publications/index.js`);

  createFile(`${__dirname}/../../templates/package.tt`,
          `./${appName}/package.json`, {appName: appName});
  createFile(`${__dirname}/../../templates/gitignore.tt`,
          `./${appName}/.gitignore`);

  if (process.env.NODE_ENV !== 'test') {
    executeCommand('npm install', {cwd: `./${appName}`});
  }
}
