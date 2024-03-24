import yargs from 'yargs';

import ipfsCommand from './commands/ipfs.command';

export const cli = async () =>
  yargs(process.argv.slice(2))
    .demandCommand()
    .usage('Usage: $0 <command> [options]')
    .showHelpOnFail(true, 'Use --help for available options')
    .recommendCommands()
    .help()
    .env('SOKETIPFS_')
    .command(ipfsCommand.command, ipfsCommand.describe, ipfsCommand.builder)
    .argv;
