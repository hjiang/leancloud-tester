exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('downtimes', {
    id: 'id',
    test_name: { type: 'varchar(128)', notNull: true},
    start_result_id: { type: 'integer references results(id)', notNull: true },
    start_time: { type: 'timestamp', notNull: true },
    end_result_id: { type: 'integer references results(id)' },
    end_time: { type: 'timestamp' }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('downtimes')
};
