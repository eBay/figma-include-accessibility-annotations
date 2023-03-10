/* eslint-disable */
const AdmZip = require('adm-zip');
const chalk = require('chalk');
/* eslint-enable */
const fs = require('fs');
const { name, version } = require('./package.json');

const divider = '---------------------------------';

async function zipFunc() {
  const distExists = await fs.existsSync('./dist');
  const distZipsExists = await fs.existsSync('./dist_zips');

  // if dist exists
  if (distExists) {
    // if zip
    if (distZipsExists === false) {
      await fs.mkdirSync('./dist_zips');
    }

    // creating archives
    const zip = new AdmZip();

    // add manifest file to zip
    zip.addLocalFile('./manifest.json');

    // add dist directory to zip
    zip.addLocalFolder('./dist/', 'dist');

    // save zip to directory
    const zipName = `${name}_v${version}`;
    const zipPath = `./dist_zips/${zipName}.zip`;
    zip.writeZip(zipPath);

    console.log(chalk.greenBright('plugin bundled and zipped'));
    console.log(chalk.greenBright(`location: ${zipPath}`));
    console.log(chalk.blackBright(divider));
  } else {
    console.log(chalk.red('/dist/ does not exist'));
    console.log(
      chalk.red(`make sure you run: ${chalk.green.bold('npm run bundle')}`)
    );
    console.log(chalk.blackBright(divider));
  }
}

zipFunc();
