exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('latest_results', {
    result_id: 'integer unique references results(id)',
    test_name: { type: 'varchar(128)', notNull: true, unique: true },
    is_successful: { type: 'boolean', notNull: true},
    info: { type: 'text' },
    time: {
      type: 'timestamp',
      notNull: true,
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('latest_results');
};
