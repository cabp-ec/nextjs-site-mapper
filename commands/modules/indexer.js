const SITE_URL = process.env.SITE_URL;
const API_BASE_URL = process.env.API_BASE_URL;
const OUTPUT_PATH = process.env.OUTPUT_PATH;

const http = require('./http');
const pagerIndexes = require('./pagerIndexes');

module.exports = async (structure) => {
  const output = {};

  for (const key of Object.keys(structure)) {
    const hasGroups = undefined !== structure[key].groups;
    const fromApi = Boolean(structure[key].api);
    const isList = Boolean(structure[key].list);
    output[key] = {
      maps: [],
      urls: []
    };

    if (fromApi && isList) {
      const pgIndexes = await pagerIndexes(key);
      output[key].maps = pgIndexes.maps;
      output[key].output = pgIndexes.output;
      output[key].urls = pgIndexes.urls;
      output[key].firstData = pgIndexes.data;
    }
    else if (fromApi && hasGroups) {
      output[key].maps = [`${ SITE_URL + key }.xml`];
      output[key].output = [`${ OUTPUT_PATH + key }.xml`];
      output[key].urls = [`${ API_BASE_URL }/${ key }`];
      output[key].firstData = await http.get(`${ API_BASE_URL }/${ key }`);
    }
    else {
      output[key].maps = [`${ SITE_URL + key }.xml`];
      output[key].output = [`${ OUTPUT_PATH + key }.xml`];
      output[key].urls = [];
      output[key].firstData = [];
    }
  }

  return output;
}

