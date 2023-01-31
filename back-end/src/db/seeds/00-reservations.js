const reservations = require("./00-reservations.json")

// seed deletes the entire reservation table, and then inserts sample reservations from reservation.json
exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(() => knex("reservations").insert(reservations));
};
