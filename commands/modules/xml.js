const SITE_URL = process.env.SITE_URL;
const invalidChars = [
  { find: ',', replace: '' },
  { find: '.', replace: '' },
  { find: /\s/g, replace: '-' }
];

module.exports = {
  mainPage: (key, priority = 0.8) => {
    const loc = `<loc>${ SITE_URL }${ key }</loc>`;
    const lastmod = `<lastmod>${ (new Date()).toISOString() }</lastmod>`;
    const _priority = `<priority>${ priority }</priority>`;
    return `<url>${ loc }${ lastmod }${ _priority }</url>`;
  },
  list: (key, structure, data, priority = 0.6) => {
    const { joint, values } = structure.domain;
    const output = [];

    data.forEach(item => {
      const segment = values.map(val => {
        let itemValue = String(item[val]).toLowerCase();

        invalidChars.forEach(char => {
          itemValue = itemValue.replace(char.find, char.replace);
        });

        return itemValue;
      }).join(joint);
      const loc = `<loc>${ SITE_URL }${ key }/${ segment }</loc>`;
      const lastmod = `<lastmod>${ (new Date()).toISOString() }</lastmod>`;
      const _priority = `<priority>${ priority }</priority>`;
      output.push(`<url>${ loc }${ lastmod }${ _priority }</url>`);
    });

    return output.join('');
  },
  groups: (key, structure, data, priority = 0.8) => {
    const output = [];

    Object.keys(data).forEach(grpKey => {
      const config = structure.groups[grpKey]
      const children = data[grpKey];

      children.forEach(item => {
        const loc = `<loc>${ SITE_URL }${ config.page }/${ item[config.key] }</loc>`;
        const lastmod = `<lastmod>${ (new Date()).toISOString() }</lastmod>`;
        const _priority = `<priority>${ priority }</priority>`;
        output.push(`<url>${ loc }${ lastmod }${ _priority }</url>`);
      });
    });

    return output.join('');
  },
  index: (entries) => {
    const prefix = '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const suffix = '</sitemapindex>';
    const output = entries.map(entry => {
      return `<sitemap><loc>${ entry }</loc></sitemap>`;
    });

    return `${ prefix }${ output.join('') }${ suffix }`;
  }
}

