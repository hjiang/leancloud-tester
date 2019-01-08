import { Client } from 'pg';
export interface Logger {
  pass: () => void;
  fail: (msg: string) => void;
}

function timeString() {
  return (new Date()).toISOString();
}

export class ConsoleLogger implements Logger {
  constructor(public testName: string) { }

  pass() {
    console.log(`PASS: (${timeString()}) ${this.testName}`);
  }

  fail(msg: string) {
    console.error(`FAIL: (${timeString()}) ${this.testName}: ${msg}`);
  }
}

interface Result {
  id?: number;
  testName: string;
  successful: boolean;
  info: null | string;
  time?: Date;
}
export class PostgresLogger implements Logger {
  client: Client;
  initialized: boolean;

  constructor(public testName: string, pgUri: string) {
    this.client = new Client({ connectionString: pgUri });
    this.initialized = false;
  }

  maybeInitClient = async () => {
    if (!this.initialized) {
      await this.client.connect();
      this.initialized = true;
    }
  }

  recordResult = async (result: Result) => {
    await this.maybeInitClient();
    const dbResult: any = await this.client.query(`
      INSERT INTO results(test_name, is_successful, info) VALUES($1, $2, $3)
      RETURNING *`,
      [result.testName, result.successful, result.info]);
    const savedResult = dbResult.rows[0];
    await this.client.query(`
      INSERT INTO latest_results(result_id, test_name, is_successful, time)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (test_name)
      DO UPDATE SET (result_id, test_name, is_successful, time) = ($1, $2, $3, $4)`,
      [savedResult.id, savedResult.test_name, savedResult.is_successful,
      savedResult.created_at]);
  }

  async pass() {
    this.recordResult({
      testName: this.testName,
      successful: true,
      info: null
    });
    console.log(`PASS: (${timeString()})`);
  }

  async fail(msg: string) {
    this.recordResult({
      testName: this.testName,
      successful: false,
      info: null
    });
    console.error(`FAIL: (${timeString()}) ${msg}`);
  }
}
