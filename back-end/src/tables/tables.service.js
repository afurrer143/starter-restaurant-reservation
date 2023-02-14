const knex = require("../db/connection");

// list returns the entirety of the reservation table
function list() {
  return knex("tables as t")
    .leftJoin("reservations as r", "r.reservation_id", "t.reservation_id")
    .select(
      "t.*",
      "r.reservation_id",
      "r.first_name",
      "r.last_name",
      "r.mobile_number",
      "r.reservation_date",
      "r.reservation_time",
      "r.people",
      "r.status"
      )
      .orderBy("t.table_name")
    }

function create(newTable) {
  return knex("tables")
    .insert(newTable)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

// Gonna try and see what happens when I by default join a reservation ID
// Ideal case, it adds no information from reservation
function read(tableId) {
  return knex("tables as t")
    .where("table_id", tableId)
    .leftJoin("reservations as r", "r.reservation_id", "t.reservation_id")
    .select(
      "t.*",
      "r.reservation_id",
      "r.first_name",
      "r.last_name",
      "r.mobile_number",
      "r.reservation_date",
      "r.reservation_time",
      "r.people",
      "r.status"
    );
}

// Find a table, based on name
function readByName(tableName) {
  return knex("tables").select("*").where("table_name", tableName).first();
}

// updates the reservation id and status for a certain table
// although when it returns info, it is just the table info, aka no reservation info
function seatTable(seatedTableInfo) {
  let { tableId, reservationId, tableStatus } = seatedTableInfo;
  return knex("tables").where("table_id", tableId).update(
    {
      reservation_id: reservationId,
      table_status: tableStatus,
    },
    "*"
  );
}

function emptyATable(emptiedTableInfo) {
  let { tableId, reservationId, tableStatus } = emptiedTableInfo;
  return knex("tables").where("table_id", tableId).update(
    {
      reservation_id: reservationId,
      table_status: tableStatus,
    },
    "*"
  );
}

//   knex.transaction(async (trx) => {
//     await trx('reservations').where("reservation_id", reservationId).update({ status: tableStatus });

//     await trx('tables').where("table_id", tableId).update({ reservation_id: reservationId, table_status: tableStatus });

//     return trx.commit();
//   }).catch((err) => {
//     console.error(err);
//   });

module.exports = {
  list,
  create,
  read,
  readByName,
  seatTable,
  emptyATable,
};
