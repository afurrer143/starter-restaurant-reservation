import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useLocation } from "react-router-dom";
import { next, previous, today } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
// date is by default, today's date, and is not a state. Just a string
function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState("");
  const [reservationsError, setReservationsError] = useState(null);

  const location = useLocation().search;
  const dateParameter = new URLSearchParams(location).get("date");

  const history = useHistory();

  useEffect(loadDashboard, [date, dateParameter]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    if (dateParameter !== null) {
      setDate(dateParameter);
    } else {
      setDate(today());
    }
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
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

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {JSON.stringify(reservations)}
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
