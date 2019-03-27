const menus: { [propName: string]: string } = {
  main: `
    test-leancloud [command] <options>

    storage ............ test LeanStorage
    message ............ test LeanMessage
    version ............ show package version
    help ............... show help menu for a command`,

  storage: `
    test-leancloud storage <options>

    --appId ............ LeanCloud appId of the app used for testing
    --appKey ........... LeanCloud appKey
    --pgUri ............ PostgreSQL URI for recording results (optional)
    --continuous ....... Continuously repeat the test`,

  message: `
    test-leancloud message <options>

    --appId ............ LeanCloud appId of the app used for testing
    --appKey ........... LeanCloud appKey
    --pgUri ............ PostgreSQL URI for recording results (optional)
    --continuous ....... Continuously repeat the test`,
}

export = (args: { _: string[] }) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
