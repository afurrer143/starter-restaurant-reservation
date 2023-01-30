
exports.up = function(knex) {
    return knex.schema.table('reservations', table => {
        table.string('status', 128).notNullable().defaultTo('booked');
      })
};

exports.down = function(knex) {
    return knex.schema.table('reservations', table => {
        table.dropColumn('status');
      })
};
