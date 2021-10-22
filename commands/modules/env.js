const dotenv = require('dotenv');

module.exports = (path) => {
  const envFileRead = dotenv.config({ path });

  if (envFileRead.error) {
    throw envFileRead.error;
  }

  const env = envFileRead.parsed;

  return Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${ next }`] = JSON.stringify(env[next]);
    return prev;
  }, {});
}
