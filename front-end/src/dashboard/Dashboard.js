import React, { useEffect, useState } from "react";
import { listReservations, listTables, clearTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationCard from "./reservationCards";
import TableCard from "./TableCards";
import { useHistory, useLocation } from "react-router-dom";
import { next, previous, today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
// date is by default, today's date, and is not a state. Just a string
function Dashboard({refresh, setRefresh}) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [date, setDate] = useState("");

  const location = useLocation().search;
  const dateParameter = new URLSearchParams(location).get("date");

  const history = useHistory();

  

  useEffect(loadDashboard, [date, dateParameter, refresh]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);
    if (dateParameter !== null) {
      setDate(dateParameter);
    } else {
      setDate(today());
    }
    // get all reservations, save in react
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    // and this gets all tables, saved in react
    listTables(abortController.signal)
      .then(setTables)
      .catch(setTablesError);

    return () => abortController.abort();
  }
  // so currently reservations is an array of all my reservations matching date paramenter (defaulted to today)

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

    //   so that the seat button only appears on seat page, i call this function into the params of TableCard, where it then runs it
    function button(status, tableId, reservationId) {
      if (status === "occupied") {
        return (
          <div>
            <button
              className={`btn btn-primary`}
              type="submit"
              data-table-id-finish={tableId}
              onClick={() => clearTableHandler(tableId, reservationId)}
            >
              Finish
            </button>
          </div>
        );
      }
    }

    async function clearTableHandler(tableId, reservationId) {
      if (window.confirm("Is this table ready to seat new guests?")) {
        // api call to clear table
        const abortController = new AbortController();
        await clearTable(tableId, reservationId, abortController.signal)
          .then(() => {
            // e2e testing needs a datebase refresh after, so i will just call load dashboard
            loadDashboard()
            
            // setRefresh(!refresh);
          })
          .catch(setTablesError)
        
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
                    refresh={refresh}
                    setRefresh={setRefresh}
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
                  <TableCard key={table.table_id} table={table} options={button}/>
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
