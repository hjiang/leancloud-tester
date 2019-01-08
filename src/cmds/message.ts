import { Logger, ConsoleLogger, PostgresLogger } from '../common/logger';
const { Realtime, TextMessage, Event } = require('leancloud-realtime');

interface MessageArgs {
  appId: string;
  appKey: string;
  continuous?: boolean;
  pgUri?: string;
}

export = async (args: MessageArgs) => {
  const rtm = new Realtime({
    appId: args.appId,
    appKey: args.appKey
  });
  const logger = args.pgUri? new PostgresLogger('LeanMessage', args.pgUri) : new ConsoleLogger('LeanMessage');
  do {
    await checkMessage(rtm, logger);
  } while (args.continuous);
  process.exit();
};

function waitUntil(cond: () => boolean, seconds?: number) {
  var remainingAttempts = seconds || 10;
  return new Promise((resolve, reject) => {
    const _wait = () => {
      remainingAttempts--;
      if (cond()) {
        resolve();
      } else if (remainingAttempts <= 0) {
        reject('Timeout reached but expected condition is not met.');
      } else {
        setTimeout(_wait, 1000);
      }
    }
    _wait();
  });
}

async function checkMessage(rtm: any, logger: Logger) {
  var alice = null;
  var bob = null
  try {
    alice = await rtm.createIMClient('alice');
    bob = await rtm.createIMClient('bob');
    var bobReceivedMessage = false;
    const conv = await alice.createConversation({ members: ['bob'], name: 'test' });
    bob.on(Event.MESSAGE, function (msg: any, _: any) {
      if (msg.getText() === 'test msg') {
        bobReceivedMessage = true;
      } else {
        logger.fail(`Bob received unmatching message!`);
      }
    });
    const msg = await conv.send(new TextMessage('test msg'));
    if (msg.getText() !== 'test msg') {
      throw new Error('Alice did not receive back expected message.');
    }
    await waitUntil(() => bobReceivedMessage, 20);
    logger.pass();
  } catch (e) {
    logger.fail(`${e}`);
  } finally {
    alice && alice.close();
    bob && bob.close();
  }
}