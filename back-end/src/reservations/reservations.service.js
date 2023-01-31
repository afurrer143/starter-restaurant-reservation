const knex = require("../db/connection")

// list returns the entirety of the reservation table
function list() {
    return knex("reservations").select("*")
}

// create takes a new reservation (which is validated in controller, inserts it and returns the new reservation) ((Technically i believe insert canbe used to insert multiple things, .first() will as it name implies only return the first thing insert but the rest will still be put in..i think))
function create(newReservation) {
    return knex("reservations")
        .insert(newReservation)
        .returning("*")
        .then((createdRecords) => createdRecords[0]);
}

module.exports = {
    list,
    create,
}