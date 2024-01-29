let originalArgv: string[];
let originalExit: typeof process.exit;

// const runCommand = async (...args: string[]) => {
//   process.argv = ['', '', ...args];
//   return import('./cli');
// };

describe('cli', () => {
  beforeEach(() => {
    vitest.resetModules();
    originalArgv = process.argv;
    originalExit = process.exit;
  });

  afterEach(() => {
    vitest.resetAllMocks();
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  it.todo('should work', async () => {
    //
  });
});
