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
    await this.client.query('INSERT INTO results(test_name, is_successful) VALUES($1, $2)',
      [this.testName, true]);
    console.log(`PASS: (${timeString()})`);
  }

  async fail(msg: string) {
    await this.maybeInitClient();
    await this.client.query('INSERT INTO results(test_name, is_successful, info) VALUES($1, $2, $3)',
      [this.testName, true, msg]);
    console.error(`FAIL: (${timeString()}) ${msg}`);
  }
}
