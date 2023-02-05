const knex = require("../db/connection");

// list returns the entirety of the reservation table
function list() {
  return knex("reservations").select("*");
}

// get reservation that match the date
// need to add where this does not get reservation with status of "finished"
function listOnDate(date) {
  return knex("reservations")
    .select("*")
    .where("reservation_date", date)
    .whereNot("status", "finished")
    .orderBy([{ column: "reservation_date" }, { column: "reservation_time" }]);
}

// create takes a new reservation (which is validated in controller, inserts it and returns the new reservation) ((Technically i believe insert canbe used to insert multiple things, .first() will as it name implies only return the first thing insert but the rest will still be put in..i think))
function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// read one specific reservation
function read(reservationId) {
  return knex("reservations")
    .select("*")
    .where("reservation_id", reservationId)
    .first();
}

function setStatus(reservationInfo) {
  let { reservationId, reservationStatus } = reservationInfo;
  return knex("reservations")
    .where("reservation_id", reservationId)
    .update(
        {
        status: reservationStatus,
        },
        "*"
    )
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  list,
  create,
  listOnDate,
  read,
  setStatus,
};
