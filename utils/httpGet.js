const axios = require('axios')

module.exports = async (url) => {
  const results = await axios({
    method: 'get',
    url
  });

  return results.data;
}
