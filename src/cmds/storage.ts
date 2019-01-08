import storage from 'leancloud-storage';
import { Logger, ConsoleLogger, PostgresLogger } from '../common/logger';

interface StorageArgs {
  appId: string;
  appKey: string;
  continuous?: boolean;
  pgUri?: string;
}

export = async (args: StorageArgs) => {
  storage.init({appId: args.appId, appKey: args.appKey});
  const logger = args.pgUri? new PostgresLogger('LeanStorage', args.pgUri) : new ConsoleLogger('LeanStorage');
  do {
    await checkStorage(logger);
  } while (args.continuous);
  process.exit();
};

async function checkStorage(logger: Logger) {
  try {
    const TestClass = storage.Object.extend('TestClass');

    const query = new storage.Query(TestClass);
    const newObj = new TestClass();
    newObj.set('msg', 'testmsg');
    const savedObj = await newObj.save();
    const id = savedObj.getObjectId();
    if (!id || id.length === 0) {
      throw new Error('Invalid ObjectId');
    }

    const testObj = await query.first();
    if (!testObj.get('msg') || testObj.get('msg').length === 0) {
      throw new Error('Did not receive expected data');
    }

    await testObj.destroy();
    await logger.pass();
  } catch (e) {
    await logger.fail(`${e}`);
  }
}
