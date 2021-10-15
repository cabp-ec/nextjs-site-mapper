const axios = require('axios')
const chalk = require('chalk');

module.exports = async (key, baseUrl) => {
  const url = `${ baseUrl }/${ key }`;
  // console.log(chalk.grey(`\t${ url }`));

  const results = await axios({
    method: 'get',
    url
  });

  return results.data;
}
