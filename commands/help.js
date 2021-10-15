const menus = {
  main: `
    sitemap [command] <options>
    generate .............. generates a new sitemap.xml file
    forecast ........... show 10-day weather forecast
    version ............ show package version
    help ............... show help menu for a command`,

  generate: `
    generate today <options>
    --website, -w ..... the website config to use`,
}

module.exports = (website, args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
