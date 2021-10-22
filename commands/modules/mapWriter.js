const xml = require('./xml');
const file = require('./file');
const http = require('./http');
const chalk = require('chalk');

const xmlPrefix = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
const xmlSuffix = '</urlset>';

module.exports = async (structure, indexes, upload) => {
  let mapIndexEntries = [];
  let _m = 0;
  let _c = 0;

  console.log(chalk.grey(`\tabout to write ${ _m } files`));

  const checkReady = () => {
    if (_c === _m) {
      console.log(chalk.bgRed.white(`\tReady`));

      if (true === upload) {
        require(`./../upload`)();
      }
    }
  };

  Object.keys(indexes).forEach(key => {
    const index = indexes[key];
    _m += index.maps.length;
  });

  for (const key of Object.keys(indexes)) {
    const index = indexes[key];
    const isList = Boolean(structure[key].list);
    const hasGroups = undefined !== structure[key].groups;
    const _mapIndexEntries = JSON.parse(JSON.stringify(mapIndexEntries));
    mapIndexEntries = _mapIndexEntries.concat(index.maps);

    // Main page entry
    const firstEntry = xml.mainPage(key, key === 'home' ? 1.0 : 0.8);

    // TODO: use writeAsync, ensure data don't get messed-up
    for (let i = 0; i < index.maps.length; i++) {
      const url = index.urls[i];
      const path = index.output[i];
      const data = i === 0 ? index.firstData : (await http.get(url)).data;

      if (true === isList) {
        const entries = xml.list(key, structure[key], data);
        const content = `${ xmlPrefix }${ firstEntry }${ entries }${ xmlSuffix }`;

        file.write(path, content, (err) => {
          if (err) return console.log(err);
          console.log(chalk.yellow(`\t${ path }\t[ok]`));
          _c++;
          checkReady();
        });
      }
      else if (true === hasGroups) {
        const entries = xml.groups(key, structure[key], data);
        const content = `${ xmlPrefix }${ firstEntry }${ entries }${ xmlSuffix }`;

        file.write(path, content, (err) => {
          if (err) return console.log(err);
          console.log(chalk.yellow(`\t${ path }\t[ok]`));
          _c++;
          checkReady();
        });
      }
      else {
        const content = `${ xmlPrefix }${ firstEntry }${ xmlSuffix }`;

        file.write(path, content, (err) => {
          if (err) return console.log(err);
          console.log(chalk.yellow(`\t${ path }\t[ok]`));
          _c++;
          checkReady();
        });
      }
    }
  }

}

