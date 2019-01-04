exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createIndex('results', 'test_name');
};

exports.down = (pgm) => {
  pgm.dropIndex('results', 'test_name');
};
