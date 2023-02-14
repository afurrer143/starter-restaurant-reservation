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

// search database for partial matches to inputted phone number (not phone number is not validated in anyway)
// and allows for partial matches (ex 281-555 will show any phone numb in DB with those numbers in the begining)
function searchPhoneNumber(phoneNumber) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${phoneNumber.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

// create takes a new reservation (which is validated in controller, inserts it and returns the new reservation) ((Technically i believe insert canbe used to insert multiple things, .first() will as it name implies only return the first thing insert but the rest will still be put in..i think))
function create(newReservation) {
  return knex("reservations")
    .insert(newReservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// read one specific reservation based on id
function read(reservationId) {
  return knex("reservations")
    .select("*")
    .where("reservation_id", reservationId)
    .first();
}

// set status of a reservation to booked, completed, or finished
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

// update a current reservation or cancel it
function update(updatedReservation) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation, "*")
    .then((createdRecords) => createdRecords[0]);
}

module.exports = {
  list,
  create,
  listOnDate,
  searchPhoneNumber,
  read,
  setStatus,
  update,
};
