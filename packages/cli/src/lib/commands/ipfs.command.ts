import { CommandModule } from 'yargs';

import start from './ipfs/start.command';

export const command: CommandModule['command'] = 'ipfs';

export const describe: CommandModule['describe'] =
  'Interact with the IPFS system built into the CLI.';

export const builder: CommandModule['builder'] = (cli) =>
  cli.command(start.command, start.describe, start.builder, start.handler);

export default {
  command,
  describe,
  builder,
};
