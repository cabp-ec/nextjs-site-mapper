const axios = require('axios')
const chalk = require('chalk');

module.exports = async (url) => {
  console.log(chalk.grey(`\tFetching ${ url }`));

  const results = await axios({
    method: 'get',
    url
  });

  return results.data;
}
