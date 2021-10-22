const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const convert = require('xml-js');
const getPageData = require('../utils/page');
const httpGet = require('../utils/httpGet');

// Variables & Constants
const SITE_URL = process.env.SITE_URL;
const API_BASE_URL = process.env.API_BASE_URL;
const MAX_ITEMS = Number(process.env.MAX_ITEMS);
const _date = new Date();
const _prioritySub = 0.20;
const siteMapSchema = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8'
    }
  },
  elements: [
    {
      type: 'element',
      name: 'urlset',
      attributes: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
        "xsi:schemaLocation": 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
      },
      elements: []
    }
  ]
};
let _priority = 1.0;

const arrayChunks = (entries) => {
  const chunks = [];

  for (let i = 0; i < entries.length; i += MAX_ITEMS) {
    const chunk = entries.slice(i, i + MAX_ITEMS);
    chunks.push(chunk);
  }

  return chunks;
};

/**
 * Create a site map entry
 * @param loc
 * @param priority
 * @returns {{loc: string, priority, lastmod: string}}
 */
const newEntry = (loc, priority) => {
  const lastmod = _date.toISOString();

  return {
    loc: `${ SITE_URL }${ loc }`,
    lastmod,
    priority
  };
};

/**
 * Create map for a group of content
 * @param key
 * @param groupKey
 * @param group
 * @param groupData
 * @param subFactor
 * @returns {*}
 */
const newEntryGroup = (key, groupKey, group, groupData, subFactor = 1) => {
  const { keyId } = group;

  return groupData.map(_item => {
    const loc = (key === 'home' ? '' : `${ key }`) + `${ group.page }/${ _item[keyId] }`;
    return newEntry(loc, _priority - (_prioritySub * subFactor));
  });
};

/**
 * Create map for the given page and its groups or list
 * @param key
 * @param structure
 * @param pageData
 * @returns {{}}
 */
const newEntryPage = (key, structure, pageData) => {
  const entries = {};

  // Generate entry for the given page
  const factor = key === 'home' ? 1 : 2;
  const locPage = key === 'home' ? '' : key;
  const priority = key === 'home' ? _priority : (_priority - _prioritySub);
  entries.page = newEntry(locPage, priority);

  // Generate entry for children
  entries.children = [];

  if (true === structure.list) {
    console.log(chalk.cyan(`\t${ key }`));

    pageData.forEach(_item => {
      const { joint, values } = structure.domain;
      const segments = values.map(val => {
        const chars = [
          { find: ',', replace: '' },
          { find: '.', replace: '' },
          { find: /\s/g, replace: '-' }
        ];
        let itemValue = String(_item[val]).toLowerCase();

        chars.forEach(char => {
          itemValue = itemValue.replace(char.find, char.replace);
        });

        return itemValue;
      });
      const segment = segments.join(joint);
      const loc = `${ locPage }/${ segment }`;

      entries.children.push(newEntry(loc, _priority - (_prioritySub * factor)));
    });

    console.log(chalk.yellow(`\t\t${ pageData.length } entries\t[ok]`));
  }
  else if (undefined !== structure.groups) {
    Object.keys(structure.groups).forEach(groupKey => {
      console.log(chalk.grey(`\t${ pageData[groupKey].length }`));

      if (0 < pageData[groupKey].length) {
        const _children = JSON.parse(JSON.stringify(entries.children));
        const groupChildren = newEntryGroup(key, groupKey, structure.groups[groupKey], pageData[groupKey], factor);
        console.log(chalk.grey(`\t${ groupKey }`), _children.length, groupChildren.length);
        entries.children = _children.concat(groupChildren);
      }
    });
  }

  return entries;
};

const writeFile = (path, contents, callBack = null) => {
  const segments = path.split('/');
  const _cb = null !== callBack ? callBack : (err) => {
    if (err) return console.log(err);
    console.log(chalk.yellow(`\t${ segments[segments.length - 1] }\t[ok]`));
  };

  fs.writeFile(path, contents, _cb);
};

/**
 * Generate the sitemapindex.xml file
 * @param indexes
 * @param outputPath
 */
const generateIndex = (indexes, outputPath) => {
  console.log(chalk.grey('\n4. Generate sitemapindex.xml'));
  const path = `${ outputPath }sitemapindex.xml`;

  const schema = {
    declaration: {
      attributes: {
        version: '1.0',
        encoding: 'UTF-8'
      }
    },
    elements: [
      {
        type: 'element',
        name: 'sitemapindex',
        attributes: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
        },
        elements: indexes.map(url => {
          return {
            type: 'element',
            name: 'sitemap',
            elements: [
              {
                type: 'element',
                name: 'loc',
                elements: [
                  { type: 'text', text: `${ url }` }
                ]
              }
            ]
          };
        })
      }
    ]
  };

  writeFile(path, convert.js2xml(schema), (err) => {
    if (err) return console.log(err);
    console.log(chalk.yellow('\tsitemapindex.xml\t[ok]'));
  });
};

/**
 * Generate a [sitemap].xml per entry
 * @returns {string}
 * @param _entries
 * @param outputPath
 */
const generateSiteMaps = (_entries, outputPath) => {
  console.log(chalk.grey('\n5. Generate [sitemap].xml files'));
  const indexes = [];
  const keys = Object.keys(_entries);
  let _t = 0;

  keys.forEach(key => {
    const schema = JSON.parse(JSON.stringify(siteMapSchema));
    const entry = _entries[key];
    const entries = [entry.page].concat(entry.children);
    const chunks = entries.length > MAX_ITEMS
      ? arrayChunks(entries)
      : [entries];

    chunks.forEach((chunk, index) => {
      const suffix = 1 === chunks.length ? '' : `_${ index + 1 }`;
      const fileName = `${ key }${ suffix }.xml`;
      const path = `${ outputPath }${ fileName }`;
      const url = `${ SITE_URL }${ fileName }`;

      schema.elements[0].elements = chunk.map(item => {
        return {
          type: 'element',
          name: 'url',
          elements: [
            {
              type: 'element',
              name: 'loc',
              elements: [
                { type: 'text', text: item.loc }
              ]
            },
            {
              type: 'element',
              name: 'lastmod',
              elements: [
                { type: 'text', text: item.lastmod }
              ]
            },
            {
              type: 'element',
              name: 'priority',
              elements: [
                { type: 'text', text: item.priority }
              ]
            }
          ]
        };
      });

      writeFile(path, convert.js2xml(schema), (err) => {
        if (err) return console.log(err);

        indexes.push(url);
        console.log(chalk.yellow(`\t${ fileName }\t[ok]`), _t, keys.length);

        if (_t === keys.length) {
          generateIndex(indexes, outputPath);
        }

        _t++;
      });
    });
  });
};

/**
 * Module
 * @returns {Promise<void>}
 * @param params
 */
module.exports = async (params) => {
  const { configPath, outputPath } = params;

  try {
    const _siteData = {};
    const _pagedData = {};
    const _entries = {};

    console.log(chalk.grey('1. Load site structure'));
    const structure = JSON.parse(fs.readFileSync(configPath));
    console.log(chalk.yellow(`\t[ok]`));

    // Load paged data (from pg.2)
    const loadPagedData = async (params) => {
      const { key, last_page, next_page_url } = params;
      const baseUrl = next_page_url.split('?')[0];

      for (let index = 2; index <= last_page; index++) {
        const data = await httpGet(`${ baseUrl }?page=${ index }`);
        const previous = JSON.parse(JSON.stringify(_pagedData[key]));
        _pagedData[key] = previous.concat(data.data);
        console.log(chalk.grey(`\t\t${ index }\t${ data.data.length }\t${ _pagedData[key].length }`));
      }
    }

    console.log(chalk.grey('\n2. Load site data (all pages)'));

    const loadSiteData = async _ => {
      const keys = Object.keys(structure);

      for (let index = 0; index < keys.length; index++) {
        console.log(chalk.cyan(`\t${ keys[index] }`));
        const key = keys[index];
        const data = await getPageData(key, API_BASE_URL);

        if (true === structure[key].list) {
          console.log(chalk.grey(`\t\tpg\titems\ttotal`));

          // Set pg.1
          _pagedData[key] = data.data;
          console.log(chalk.grey(`\t\t1\t${ _pagedData[key].length }\t${ _pagedData[key].length }`));

          // Other pages
          const { last_page, next_page_url } = data;
          await loadPagedData({ key, last_page, next_page_url });
          _siteData[key] = _pagedData[key];
        } else {
          _siteData[key] = data;
        }
      }
    }
    await loadSiteData();

    console.log(chalk.grey('\n3. Generate entries'));
    Object.keys(structure).forEach(key => {
      _entries[key] = newEntryPage(key, structure[key], _siteData[key]);
    });

    generateSiteMaps(_entries, outputPath);
    // generateMaps(_entries, outputPath);
  } catch (err) {
    console.error(err)
  }
}
