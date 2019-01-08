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

  getLatestResult: () => Promise<Result | null> = async () => {
    const dbResult = await this.client.query(`
      SELECT * FROM latest_results WHERE test_name = $1`, [this.testName]);
    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      return {
        id: row.result_id,
        testName: row.test_name,
        successful: row.is_successful,
        info: row.info,
        time: row.time
      }
    } else {
      return null;
    }
  }

  startDowntime = async (testName: string, resultId: number, time: Date) => {
    await this.client.query(`
      INSERT INTO downtimes(test_name, start_result_id, start_time)
      VALUES($1, $2, $3)`,
      [testName, resultId, time]);
  }

  endDowntime = async (testName: string, resultId: number, time: Date) => {
    await this.client.query(`
      UPDATE downtimes
      SET end_result_id = $1, end_time = $2
      WHERE test_name = $3 AND end_result_id is NULL AND end_time IS NULL`,
      [resultId, time, testName]);
  }

  recordResult = async (result: Result) => {
    await this.maybeInitClient();
    const dbResult: any = await this.client.query(`
      INSERT INTO results(test_name, is_successful, info) VALUES($1, $2, $3)
      RETURNING *`,
      [result.testName, result.successful, result.info]);
    const savedResult = dbResult.rows[0];
    const latestResult = await this.getLatestResult();
    if (latestResult) {
      if (latestResult.successful && !savedResult.is_successful) {
        this.startDowntime(savedResult.test_name, 
          savedResult.id, savedResult.created_at);
      } else if (!latestResult.successful && savedResult.is_successful) {
        this.endDowntime(savedResult.test_name, 
          savedResult.id, savedResult.created_at);
      }
    }
    await this.client.query(`
      INSERT INTO latest_results(result_id, test_name, is_successful, time)
      VALUES($1, $2, $3, $4)
      ON CONFLICT (test_name)
      DO UPDATE SET (result_id, test_name, is_successful, time) = ($1, $2, $3, $4)`,
      [savedResult.id, savedResult.test_name, savedResult.is_successful,
      savedResult.created_at]);
  }

  async pass() {
    await this.recordResult({
      testName: this.testName,
      successful: true,
      info: null
    });
    console.log(`PASS: (${timeString()})`);
  }

  async fail(msg: string) {
    await this.recordResult({
      testName: this.testName,
      successful: false,
      info: msg
    });
    console.error(`FAIL: (${timeString()}) ${msg}`);
  }
}
