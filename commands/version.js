const { version } = require('../package.json')

module.exports = (website, args) => {
  console.log(`v${ version }`)
}
