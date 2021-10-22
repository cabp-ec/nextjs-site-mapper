const fs = require('fs');
const chalk = require('chalk');

module.exports = {
  /**
   * Read file contents (raw or JSON)
   * @param path
   * @param json
   * @returns {any|Buffer}
   */
  read: (path, json = false) => {
    return true === json ? JSON.parse(fs.readFileSync(path)) : fs.readFileSync(path);
  },
  /**
   * Write contents to file
   * @param path
   * @param contents
   * @param callBack
   */
  write: (path, contents, callBack = null) => {
    const segments = path.split('/');

    fs.writeFile(path, contents, null !== callBack ? callBack : (err) => {
      if (err) return console.log(err);
      console.log(chalk.yellow(`\t${ segments[segments.length - 1] }\t[ok]`));
    });
  }
}
