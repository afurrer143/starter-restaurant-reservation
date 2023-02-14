import { useEffect } from "react";
import { clearTable } from "../utils/api";

//   so that the seat button only appears on seat page, i call this function into the params of TableCard, where it then runs it
function FinishTable({ table, refresh, setRefresh }) {
  async function clearTableHandler(tableId, reservationId, setTablesError) {
    if (window.confirm("Is this table ready to seat new guests?")) {
      // api call to clear table
      const abortController = new AbortController();
      await clearTable(tableId, reservationId, abortController.signal)
        .then(() => {
          setRefresh(!refresh);
        })
        .catch(setTablesError);
    }
  }
  let button = null;
  useEffect(() => {
    if (table.table_status === "occupied") {
      button = (
        <div>
          <button
            className={`btn btn-primary`}
            type="submit"
            data-table-id-finish={table.table_id}
            onClick={() =>
              clearTableHandler(table.table_id, table.reservation_id)
            }
          >
            Finish
          </button>
        </div>
      );
    }
  }, [table]);

  if (table) {
    
  } else {
    return null;
  }
}

export default FinishTable;
