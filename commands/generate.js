const chalk = require('chalk');
const file = require('./modules/file');

module.exports = async (params) => {
  const { configPath, upload } = params;

  try {
    console.log(chalk.grey('1. Load site structure'));
    const structure = file.read(configPath, true);

    // 2. Generate index
    console.log(chalk.grey('2. Generate index'));
    const indexes = await require('./modules/indexer')(structure);

    // 3. Generate sitemapindex.xml
    console.log(chalk.grey('3. Generate sitemapindex.xml'));
    require('./modules/sitemapindex')(indexes);

    // 4. Generate site maps XML
    console.log(chalk.grey('4. Generate site maps XML'));
    await require('./modules/mapWriter')(structure, indexes, upload);
  }
  catch (err) {
    console.error(err);
    process.exit(1);
  }
}
