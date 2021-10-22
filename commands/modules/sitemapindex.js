const OUTPUT_PATH = process.env.OUTPUT_PATH;

const xml = require('./xml');
const file = require('./file');

module.exports = (indexes) => {
  const path = `${ OUTPUT_PATH }sitemapindex.xml`;
  let entries = [];

  Object.keys(indexes).forEach(key => {
    const _maps = JSON.parse(JSON.stringify(entries));
    entries = _maps.concat(indexes[key].maps);
  });

  file.write(path, xml.index(entries));
}

