const fs = require('fs');
const chalk = require('chalk');
const aws = require('./modules/aws');

const OUTPUT_PATH = process.env.OUTPUT_PATH;

module.exports = async () => {
  const excludes = ['.gitkeep'];

  try {
    console.log(chalk.grey('Uploading sitemap(s)'));

    fs.readdir(OUTPUT_PATH, (err, files) => {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }

      files.forEach(file => {
        if (false === excludes.includes(file)) {
          console.log(`Uploading ${ file }`);
          aws.uploadFile(`${ OUTPUT_PATH }${ file }`, file);
        }
      });
    });
  }
  catch (err) {
    console.error(err);
    process.exit(1);
  }
}
