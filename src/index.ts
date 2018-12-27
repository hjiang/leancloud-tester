import minimist from 'minimist';

export = () => {
  const args = minimist(process.argv.slice(2))
  const cmd = args._[0]

  switch (cmd) {
    case 'storage':
      require('./cmds/storage')(args)
      break
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}
