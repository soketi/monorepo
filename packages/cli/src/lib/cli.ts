import yargs from 'yargs';

import ipfsCommand from './commands/ipfs.command';

yargs(process.argv.slice(1))
  .demandCommand()
  .usage('Usage: $0 <command> [options]')
  .showVersion('log')
  .showHelpOnFail(true, 'Use --help for available options')
  .recommendCommands()
  .help()
  .command(ipfsCommand.command, ipfsCommand.describe, ipfsCommand.builder).argv;
