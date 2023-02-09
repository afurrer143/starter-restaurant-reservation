import React from "react";

function TableCard({ table }) {
  return (
    <div className="card my-3">
      <div className="card-body bg-info-subtle">
        {/* not sure how i feel about status here, may remove it */}
        <p className="card-text">Table: {table.table_name}</p>
        <p className="card-text">Capacity: {table.capacity}</p>
        <p className="card-text">Status: {table.table_status}</p>
      </div>
    </div>
  );
}

export default TableCard;
