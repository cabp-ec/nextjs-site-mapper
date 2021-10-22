const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const minimist = require('minimist')

const error = require('./commands/modules/error')
const env = require('./commands/modules/env');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Sitemap', { font: 'Doom', horizontalLayout: 'full' })
  )
);

// App env
env('./.env');

// Available commands
const cmdAvail = ['generate', 'upload', 'version', 'help'];

module.exports = () => {
  const args = minimist(process.argv.slice(2));
  const website = String(args.website || args.w || 'upgrade').toLowerCase();

  // Default command
  let cmd = args._[0] || 'help';

  if (args.version || args.v) {
    cmd = 'version';
  }

  if (args.help || args.h) {
    cmd = 'help';
  }

  if (true !== cmdAvail.includes(cmd)) {
    console.log(chalk.red('YOU SHALL NOT PASS...!'));
    error(`"${ cmd }" is not a valid command!`, true);
  }

  // Execute
  const configPath = (args.config || args.c || process.env.CONFIG_PATH) + `${ website }.json`;
  const envPath = (args.config || args.c || process.env.CONFIG_PATH) + `${ website }.env`;
  const _u = args.upload || args.u;
  const upload = _u === true || _u === 'y' || _u === 'Y';
  let params;

  // ENV vars
  env(envPath);

  // Params
  switch (cmd) {
    case 'generate':
      params = { configPath, upload };
      break;
    case 'upload':
    default:
      params = null;
      break;
  }

  if (cmdAvail.includes(cmd)) {
    require(`./commands/${ cmd }`)(params);
  }
  else {
    console.log(chalk.red('YOU SHALL NOT PASS...!'));
    error(`"${ cmd }" is not a valid command!`, true);
  }
}
