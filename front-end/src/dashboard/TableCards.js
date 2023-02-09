import React from "react";

function TableCard({ table }) {
  let bgColor = "bg-info-subtle"
  if (table.table_status === "Free") {
    bgColor = "bg-info-subtle"
  }
  else if (table.table_status === "Occupied") {
    bgColor = "bg-warning"
  }
  else {
    bgColor = "bg-danger"
  }

  return (
    <div className="card my-3">
      <div className={`card-body ${bgColor}`}>
        {/* not sure how i feel about status here, may remove it */}
        <p className="card-text">Table: {table.table_name}</p>
        <p className="card-text">Capacity: {table.capacity}</p>
        <p className="card-text">Status: {table.table_status}</p>
      </div>
    </div>
  );
}

export default TableCard;
