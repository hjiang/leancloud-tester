# LeanCloud Tester

## Introduction

This is a commandline program for doing blackbox testing for various LeanCloud
features. It saves test information to a PostgreSQL database to be analyzed
later.

## How to run

This is a Node project written in TypeScript. Clone the repo and install
dependencies:

```shell
$ npm install
```

Compile to JavaScript:

```shell
$ npm run build
```

To test LeanStorage with your app once:

```shell
$ bin/test-leancloud storage --appId=<your appId> --appKey=<your appKey>
```

To run the test continuously, add the `--continuous` flag:

```shell
$ bin/test-leancloud storage --appId=<your appId> --appKey=<your appKey> \
    --continous
```

This utility is not intended for load-testing, so it never sends concurrent
requests.

To record the test results in database (see below for how to initialize the
database), add specify the URI with `--pgUri`. For example:

```shell
$ bin/test-leancloud storage --appId=<your appId> --appKey=<your appKey> \
    --continous --pgUri=postgres://localhost/leancloud_tests
```

Use `bin/test-leancloud help` to show supported commands.

### Initializing the database

If you want to save results to a database, initialize it before the first run
(assuming you have installed postgresql):

```shell
$ createdb leancloud_tests
$ DATABASE_URL=postgres://localhost/leancloud_tests npm run migrate up
```
