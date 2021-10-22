const http = require('./http');

const SITE_URL = process.env.SITE_URL;
const API_BASE_URL = process.env.API_BASE_URL;
const OUTPUT_PATH = process.env.OUTPUT_PATH;
const MAX_ITEMS = process.env.MAX_ITEMS;

module.exports = async (key) => {
  // Get pg.1
  const urlBase = SITE_URL + key;
  const apiUrlBase = `${ API_BASE_URL }/${ key }`;
  const data = await http.get(`${ apiUrlBase }?page=1&per_page=1`);
  const total = Number(data.total);
  const morePages = total > MAX_ITEMS;
  const lastIndex = Math.ceil(total / MAX_ITEMS);
  const maps = [`${ urlBase }${ morePages ? '_1' : '' }.xml`];
  const output = [`${ OUTPUT_PATH + key }${ morePages ? '_1' : '' }.xml`];
  const urls = [`${ apiUrlBase }?page=1`];

  // Generate map urls from pg.2 to 'last_page'
  if (true === morePages) {
    for (let i = 2; i <= lastIndex; i++) {
      maps.push(`${ urlBase }_${ i }.xml`);
      output.push(`${ OUTPUT_PATH + key }_${ i }.xml`);
      // urls.push(`${ apiUrlBase }?page=${ i }&per_page=${ MAX_ITEMS }`);
      urls.push(`${ apiUrlBase }?page=${ i }&per_page=1`);
    }
  }

  return {
    maps,
    output,
    urls,
    data: data.data
  };
}

