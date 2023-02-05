const knex = require("../db/connection");
// so i do need to figure out how I can get tableStatus, reservationId, tableId, and reservationStatus
async function setReservationStatusAndSeatTable(tableAndReservationInfo) {
    let {reservationId, newReservationId, reservationStatus, tableId, tableStatus} = tableAndReservationInfo
    try {
        return knex.transaction(async (trx) => {
            await trx("reservations")
              .where("reservation_id", reservationId)
              .update({ status: reservationStatus });
      
            await trx("tables")
              .where("table_id", tableId)
              .update({ reservation_id: newReservationId, table_status: tableStatus }, "*");
      
            return trx.commit();
          })
    } catch (error) {
        console.error(err);
    }
}

module.exports = setReservationStatusAndSeatTable