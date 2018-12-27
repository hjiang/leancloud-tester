exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('results', {
    id: 'id',
    test_name: { type: 'varchar(128)', notNull: true },
    is_successful: { type: 'boolean', notNull: true},
    info: { type: 'text' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('results');
};
