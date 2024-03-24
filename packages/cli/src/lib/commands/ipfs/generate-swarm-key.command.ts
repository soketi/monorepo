import { CommandModule } from 'yargs';
import { generateSwarmKey } from '@soketi/p2p';

export type StartCommandModule = CommandModule<unknown>;

export const command: StartCommandModule['command'] = 'generate:swarm-key';

export const describe: StartCommandModule['describe'] =
  'Generate the Swarm Key for the cluster.';

export const builder: CommandModule['builder'] = (cli) => cli;

export const handler: StartCommandModule['handler'] = async () => {
  process.stdout.write(generateSwarmKey());
};

export default {
  command,
  describe,
  builder,
  handler,
};
