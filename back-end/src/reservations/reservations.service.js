const knex = require("../db/connection")

// list returns the entirety of the reservation table
function list() {
    return knex("reservations").select("*")
}

module.exports = {
    list,
}