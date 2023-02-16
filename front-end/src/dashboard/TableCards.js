import { formatAsTime } from "../utils/date-time";
import React from "react";
import { clearTable } from "../utils/api";

function TableCard({ table, buttonOptions, loadDashboard }) {

  const getCardText = (table) => {
    if (table.reservation_id) {
      return (
        <>
          <p className="card-text">
            Table: {table.table_name} Used by: {table.first_name}{" "}
            {table.last_name}
          </p>
          <p className="card-text">
            Current Capacity: {table.people} out of {table.capacity}{" "}
          </p>
          <p className="card-text" data-table-id-status={table.table_id}>
            Status: <span>{table.table_status}</span>
          </p>
          <p> Seated at: {formatAsTime(table.reservation_time)} </p>
        </>
      );
    } else {
      return (
        <>
          <p className="card-text">Table: {table.table_name}</p>
          <p className="card-text">Capacity: {table.capacity}</p>
          <p className="card-text" data-table-id-status={table.table_id}>
            Status: <span>{table.table_status}</span>
          </p>
        </>
      );
    }
  };

  const getFinishButton = (table) => {
      return (
        <div>
          <button
            className={`btn btn-primary`}
            data-table-id-finish={table.table_id}
            onClick={() => clearTableHandler(table.table_id)}
          >
            Finish
          </button>
        </div>
      );
    }
  };

  // finish table handler. Sets table to free and reservation status to "occupied"
  const clearTableHandler = (tableId) => {
    if (window.confirm("Is this table ready to seat new guests?")) {
      const abortController = new AbortController();
      clearTable(tableId, abortController.signal)
        .then(loadDashboard)
        .catch((error) => console.log("error", error));
      return () => abortController.abort();
    }
  };

  const bgColor = table.table_status === "free" ? "bg-info-subtle" :
    table.table_status === "occupied" ? "bg-warning" : "bg-danger";

  const button = buttonOptions ? buttonOptions(table.table_status, table.table_id, table.reservation_id) : null;
  const finishButton = getFinishButton(table);

  return (
    <div className="card my-3">
      <div className={`card-body ${bgColor}`}>
        {getCardText(table)}
        {button}
        {finishButton}
      </div>
    </div>
  );
}

export default TableCard;