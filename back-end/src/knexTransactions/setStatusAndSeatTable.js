const knex = require("../db/connection");
// so i do need to figure out how I can get tableStatus, reservationId, tableId, and reservationStatus
async function setReservationStatusAndSeatTable(tableAndReservationInfo) {
  let {
    reservationId,
    newReservationId,
    reservationStatus,
    tableId,
    tableStatus,
  } = tableAndReservationInfo;

  return knex.transaction(function (trx) {
    return trx("reservations")
      .where("reservation_id", reservationId)
      .update({ status: reservationStatus })
      .returning("*")
      .then(() => {
        return trx("tables")
          .where("table_id", tableId)
          .update({
            reservation_id: newReservationId,
            table_status: tableStatus,
          })
          .returning("*")
          .then((updatedRes) => updatedRes[0]);
      });
  });
}

// await trx("tables")
//   .where("table_id", tableId)
//   .update({ reservation_id: newReservationId, table_status: tableStatus }, "*");

// return trx.commit();

module.exports = setReservationStatusAndSeatTable;
