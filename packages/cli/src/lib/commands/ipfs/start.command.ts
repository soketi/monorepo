import { CommandModule } from 'yargs';
import { prebuiltHeliaServer } from '@soketi/server';

export const command: CommandModule['command'] = 'start';

export const describe: CommandModule['describe'] =
  'Start the ipfsoketi server.';

export const builder: CommandModule['builder'] = (cli) =>
  cli.commandDir('ipfs');

export const handler: CommandModule['handler'] = async () => {
  const { helia } = await prebuiltHeliaServer();
  await helia.start();
};

export default {
  command,
  describe,
  builder,
  handler,
};
