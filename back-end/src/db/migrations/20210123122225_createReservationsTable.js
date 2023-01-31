exports.up = function (knex) {
  return knex.schema.createTable("reservations", (table) => {
    table.increments("reservation_id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("mobile_number").notNullable();
    table.date("reservation_date").notNullable();   //For date and time, it will reformat for you in the sequence it wants. EX: doing a post with "01/30/2022" and "11:00" will put "2022-01-30" and "11:00:00" into DB
    table.time("reservation_time").notNullable();
    table.integer("people").notNullable();
    table.string('status').notNullable().defaultTo('booked')
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("reservations");
};
