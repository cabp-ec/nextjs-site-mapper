const axios = require('axios')

module.exports = {
  get: async (url) => {
    const results = await axios({
      method: 'get',
      url
    });

    return results.data;
  }
}
