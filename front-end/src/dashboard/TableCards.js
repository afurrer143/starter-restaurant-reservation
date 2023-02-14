import { formatAsTime } from "../utils/date-time";
import FinishTable from "../table/finishTable";
import React from "react";

// option is a button param (pretty bad name i know) to allow an optional button to show depending where TableCard is called
// i really should make a thing, where when it has a reservation_id (or could use status, but reservation_id is more bug proof) that it shows info from the reservation too
function TableCard({ table }) {
  let bgColor = "bg-info-subtle";
  if (table.table_status === "free") {
    bgColor = "bg-info-subtle";
  } else if (table.table_status === "occupied") {
    bgColor = "bg-warning";
  } else {
    bgColor = "bg-danger";
  }

  let button = null;
  if (options) {
    button = options(table.table_status, table.table_id, table.reservation_id);
  }

  if (table.reservation_id) {
    return (
      <div className="card my-3">
        <div className={`card-body ${bgColor}`}>
          {/* not sure how i feel about status here, may remove it */}
          <p className="card-text">Table: {table.table_name} Used by: {table.first_name} {table.last_name}</p>
          <p className="card-text">Current Capacity: {table.people} out of {table.capacity} </p>
          <p className="card-text" data-table-id-status={table.table_id}>
            Status: <span>{table.table_status}</span>
          </p>
          <p> Seated at: {formatAsTime(table.reservation_time)} </p>
          <FinishTable />
        </div>
      </div>
    );
  }

  return (
    <div className="card my-3">
      <div className={`card-body ${bgColor}`}>
        {/* not sure how i feel about status here, may remove it */}
        <p className="card-text">Table: {table.table_name}</p>
        <p className="card-text">Capacity: {table.capacity}</p>
        <p className="card-text" data-table-id-status={table.table_id}>
          Status: <span>{table.table_status}</span>
        </p>
        {button}
      </div>
    </div>
  );
}

export default TableCard;
