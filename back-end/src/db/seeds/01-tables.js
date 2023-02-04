const tables = require("./01-tables.json")
// seed deletes the entire reservation table, and then inserts sample reservations from reservation.json
exports.seed = function (knex) {
    return knex
      .raw("TRUNCATE TABLE tables RESTART IDENTITY CASCADE")
      .then(() => knex("tables").insert(tables));
  };