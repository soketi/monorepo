import { CommandModule } from 'yargs';

import start from './ipfs/start.command';
import generateSwarmKey from './ipfs/generate-swarm-key.command';

export const subcommands = [start, generateSwarmKey];

export const command: CommandModule['command'] = 'ipfs';

export const describe: CommandModule['describe'] =
  'Interact with the IPFS system built into the CLI.';

export const builder: CommandModule['builder'] = (cli) => {
  for (const { command, describe, builder, handler } of subcommands) {
    cli.command(command, describe, builder, handler);
  }

  return cli;
};

export default {
  command,
  describe,
  builder,
};
