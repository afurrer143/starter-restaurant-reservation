// so i do need to figure out how I can get tableStatus, reservationId, tableId, and reservationStatus
function setReservationStatusAndSeatTable(tableAndReservationInfo) {
  return knex
    .transaction(async (trx) => {
      await trx("reservations")
        .where("reservation_id", reservationId)
        .update({ status: reservationStatus });

      await trx("tables")
        .where("table_id", tableId)
        .update({ reservation_id: reservationId, table_status: tableStatus });

      return trx.commit();
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = setReservationStatusAndSeatTable