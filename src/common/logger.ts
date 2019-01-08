import { Client } from 'pg';
export interface Logger {
  pass: () => void;
  fail: (msg: string) => void;
}

function timeString() {
  return (new Date()).toISOString();
}

export class ConsoleLogger implements Logger {
  constructor(public testName:string) {}

  pass() {
    console.log(`PASS: (${timeString()}) ${this.testName}`);
  }

  fail(msg: string) {
    console.error(`FAIL: (${timeString()}) ${this.testName}: ${msg}`);
  }
}

export class PostgresLogger implements Logger {
  client: Client;
  initialized: boolean;

  constructor(public testName: string, pgUri: string) {
    this.client = new Client({ connectionString: pgUri });
    this.initialized = false;
  }

  async maybeInitClient() {
    if (!this.initialized) {
      await this.client.connect();
      this.initialized = true;
    }
  }

  async pass() {
    await this.maybeInitClient();
    const result : any  = await this.client.query(`
      INSERT INTO results(test_name, is_successful) VALUES($1, $2)
      RETURNING *`,
      [this.testName, true]);
    const test = result.rows[0];
    await this.client.query(`
      INSERT INTO latest_results(result_id, test_name, is_successful, time)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (test_name)
      DO UPDATE SET (result_id, test_name, is_successful, time) = ($1, $2, $3, $4)`,
      [test.id, test.test_name, test.is_successful, test.created_at]);
    console.log(`PASS: (${timeString()})`);
  }

  async fail(msg: string) {
    await this.maybeInitClient();
    await this.client.query('INSERT INTO results(test_name, is_successful, info) VALUES($1, $2, $3)',
      [this.testName, false, msg]);
    console.error(`FAIL: (${timeString()}) ${msg}`);
  }
}
