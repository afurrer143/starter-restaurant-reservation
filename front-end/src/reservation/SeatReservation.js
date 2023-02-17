import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import { readReservations, listTables } from "../utils/api";
import { formatAsTime } from "../utils/date-time";
import { seatTable } from "../utils/api";
import TableCard from "../dashboard/TableCards";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation({ loadDashboard }) {
  const [readReservation, setReadReservations] = useState({});
  const [readReservationsError, setReadReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [selected, setSelected] = useState("");

  const routeMatch = useRouteMatch();
  let reservationId = routeMatch.params.reservation_id;

  const history = useHistory();

  useEffect(loadReservation, [reservationId]);

  function loadReservation() {
    const abortController = new AbortController();
    setReadReservationsError(null);
    readReservations(reservationId, null, abortController.signal)
      .then(setReadReservations)
      .catch(setReadReservationsError);

    listTables(abortController.signal).then(setTables).catch(setTablesError);

    return () => abortController.abort();
  }

  //   need to test if readReservation has finished, other wise {formatAsTime(readReservation.reservation_time) will crash the program since time will be undefined
  if (JSON.stringify(readReservation) === "{}") {
    return (
      <div>
        <ErrorAlert error={readReservationsError} />
      </div>
    );
  }

  function seatHandler(tableId) {
    const abortController = new AbortController();
    // reservationId already declared, gotten from URL params
    seatTable(tableId, reservationId, abortController.signal)
      .then(() => {
        loadDashboard();
        history.goBack();
      })
      .catch(setTablesError);

    return () => abortController.abort();
  }

  //   i need minor differences between the drop down select form and the normal buttons
  function seatOptionHandler() {
    // selected will be table Id
    let date = readReservation.reservation_date;
    let tableId = selected;
    const abortController = new AbortController();
    // reservationId already declared, gotten from URL params
    seatTable(tableId, reservationId, abortController.signal)
      .then(() => {
        loadDashboard();
        history.push(`/dashboard?date=${date}`);
      })
      .catch(setTablesError);

    return () => abortController.abort();
  }

  //   so that the seat button only appears on seat page, i call this function into the params of TableCard, where it then runs it
  function button(status, tableId) {
    if (status !== "occupied") {
      return (
        <div>
          <button
            className="btn btn-primary"
            type="submit"
            onClick={() => seatHandler(tableId)}
          >
            Seat here
          </button>
        </div>
      );
    }
  }

  function cancelHandler() {
    return history.goBack();
  }

  function changeHandler(event) {
    setSelected(event.target.value);
  }

  return (
    <div className="pt-2">
      <ErrorAlert error={readReservationsError} />
      <ErrorAlert error={tablesError} />
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <div>
            <p>
              For {readReservation.first_name} {readReservation.last_name}
            </p>
          </div>
          <div>
            <p>Time: {formatAsTime(readReservation.reservation_time)}</p>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-9">
              <p className="card-text">Status: {readReservation.status}</p>
              <p className="card-text">
                Phone Number: {readReservation.mobile_number}
              </p>
              <p className="card-text">Party Size: {readReservation.people}</p>
              <p className="card-text">{readReservation.reservation_date}</p>
            </div>
          </div>
          <br />

          <div>
            <label>Seat At Which Table?</label>
            <br />
            <select
              className="form-select"
              id="table_id"
              name="table_id"
              value={selected}
              onChange={changeHandler}
            >
              <option value="">--Please choose an option--</option>
              {tables.map((table) => {
                if (table.table_status === "free") {
                  return (
                    <option key={table.table_id} value={table.table_id}>
                      {table.table_name} - {table.capacity}
                    </option>
                  )
                } else {
                  return null
                }
              })}
            </select>
          </div>
          <br />

          <div>
            <button
              className="btn btn-primary col-auto"
              type="submit"
              onClick={() => seatOptionHandler()}
            >
              Seat here
            </button>
          </div>
          <br />
        </div>
      </div>
      <div>
        <div>
          <h4>Tables:</h4>
        </div>
        <div>
          {tables.map((table) => (
            // since i need a button on the tables, but i am just calling TableCard, and do not want button on the dashboard, I will just give it a buttom param it is called with
            <TableCard key={table.table_id} table={table} buttonOptions={button} />
          ))}
        </div>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={cancelHandler}
        >
          <i className="bi bi-x-lg"></i> Cancel
        </button>
      </div>
    </div>
  );
}

export default SeatReservation;
