exports.up = function (knex) {
    return knex.schema.createTable("tables", (table) => {
        table.increments("table_id").primary();
        table.string('table_name').notNullable().unique(); //I want the table names to be unique
        table.integer("capacity").notNullable();
        table.string('table_status').defaultTo('Free')
        table.integer('reservation_id').unsigned();
        table.foreign('reservation_id').references('reservations.reservation_id');
        table.timestamps(true, true);
    });
  };

exports.down = function(knex) {
    return knex.schema.dropTable("tables");
};
