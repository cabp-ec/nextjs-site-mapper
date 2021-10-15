const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const minimist = require('minimist')
const error = require('./utils/error')
const dotenv = require('dotenv');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Sitemap', { font: 'Doom', horizontalLayout: 'full' })
  )
);

// Available commands
const cmdAvail = ['generate', 'version', 'help'];
const formatsAvail = ['xml', 'json'];

/**
 * Read ENV vars
 * @param website
 * @returns {{}}
 */
const readEnv = (website = null) => {
  const envPath = path.resolve(`${ __dirname }/${ website ? (`config/${ website }`) : '' }.env`);
  const envFileRead = dotenv.config({ path: envPath });

  if (envFileRead.error) {
    throw envFileRead.error;
  }

  const env = envFileRead.parsed;

  return Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${ next }`] = JSON.stringify(env[next]);
    return prev;
  }, {});
};

module.exports = () => {
  const args = minimist(process.argv.slice(2));
  const website = String(args.website || args.w || 'upgrade').toLowerCase();
  const format = String(args.format || args.f || formatsAvail[0]).toLowerCase();

  // Default command
  let cmd = args._[0] || 'help';

  if (args.version || args.v) {
    cmd = 'version'
  }

  if (args.help || args.h) {
    cmd = 'help'
  }

  if (true !== cmdAvail.includes(cmd)) {
    console.log(chalk.red('YOU SHALL NOT PASS...!'));
    error(`"${ cmd }" is not a valid command!`, true);
  }

  // App and Website ENV vars
  const envApp = readEnv();
  const envWebsite = readEnv(website);

  // Execute
  const configPath = (args.config || args.c || process.env.CONFIG_PATH) + `${ website }.json`;
  const outputPath = (args.config || args.c || process.env.OUTPUT_PATH);

  if (cmdAvail.includes(cmd)) {
    require(`./commands/${ cmd }`)({ configPath, outputPath });
  } else {
    console.log(chalk.red('YOU SHALL NOT PASS...!'));
    error(`"${ cmd }" is not a valid command!`, true);
  }

  /*switch (cmd) {
    case 'generate':
      require('./commands/generate')(website, args, format);
      break;

    case 'version':
      require('./commands/version')(website, args);
      break;

    case 'help':
      require('./commands/help')(website, args);
      break;

    default:
      error(`"${ cmd }" is not a valid command!`, true)
      break;
  }*/
}
