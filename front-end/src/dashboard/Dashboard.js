import React from "react";
import { clearTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./reservationCards";
import TableCard from "./TableCards";
import { useHistory } from "react-router-dom";
import { next, previous } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */

// date is by default, today's date, and is not a state. Just a string
function Dashboard({
  loadDashboard,
  reservations,
  reservationsError,
  tables,
  setTablesError,
  tablesError,
  date,
}) {
  const history = useHistory();

  function PageHandler(number) {
    let newDate = "";
    // they even gave us functions to add or go back a day
    // i just call the function depending on the button with a certain number
    if (number === -1) {
      newDate = previous(date);
    }
    if (number === 1) {
      newDate = next(date);
    }
    if (number === 0) {
      return history.push(`/`);
    }
    history.push(`/dashboard?date=${newDate}`);
  }

  // Put this in button, and call it in table card, so Finish button only shows on dashboard
  // the dreaded finish button
  function button(status, tableId) {
    if (status === "occupied") {
      return (
        <div>
          <button
            className={`btn btn-primary`}
            data-table-id-finish={tableId}
            onClick={() => clearTableHandler(tableId)}
          >
            Finish
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  // the dreaded finish button function
  function clearTableHandler(tableId) {
    if (window.confirm("Is this table ready to seat new guests?")) {
      const abortController = new AbortController();
      clearTable(tableId, abortController.signal)
        .then(loadDashboard)
        .catch(setTablesError);
      return () => abortController.abort();
    }
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <div className="container">
        <div className="row">
          <div className="col-8">
            <div>
              <h4 className="mb-0">Reservations for {date}</h4>
            </div>
            <div>
              {reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.reservation_id}
                  reservation={reservation}
                  loadDashboard={loadDashboard}
                />
              ))}
            </div>
          </div>
          <div className="col-4">
            <div>
              <h4>Tables:</h4>
            </div>
            <div>
              {tables.map((table) => (
                <TableCard
                  key={table.table_id}
                  table={table}
                  options={button}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex">
        <div className="mr-auto p-1">
          <button
            type="button"
            className="btn btn-primary mx-1"
            onClick={() => PageHandler(-1)}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>
        <div className="mr-auto p-1">
          <button
            type="button"
            className="btn btn-primary mx-1"
            onClick={() => PageHandler(1)}
          >
            <i className="bi bi-arrow-right"></i> Next
          </button>
        </div>
        <div className="mr-auto p-1">
          <button
            type="button"
            className="btn btn-primary mx-1"
            onClick={() => PageHandler(0)}
          >
            <i className="bi bi-calendar-day-fill"></i> Today
          </button>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
