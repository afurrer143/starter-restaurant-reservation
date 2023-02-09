import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router";
import { readReservations, listTables } from "../utils/api";
import { formatAsTime } from "../utils/date-time";
import { seatTable } from "../utils/api";
import TableCard from "../dashboard/TableCards";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const [readReservation, setReadReservations] = useState({});
  const [readReservationsError, setReadReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [tableSeated, setTableSeated] = useState(false)

  const routeMatch = useRouteMatch();
  let reservationId = routeMatch.params.reservation_id;

  useEffect(loadReservation, [reservationId, tableSeated]);

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

  async function seatHandler(tableId) {
    const abortController = new AbortController();
    // reservationId already declared, gotten from URL params
    await seatTable(tableId, reservationId ,abortController.signal)
        .then(loadReservation())
        .catch(setTablesError)

    return () => abortController.abort();
  }

//   so that the seat button only appears on seat page, i call this function into the params of TableCard, where it then runs it
  function button(status, tableId) {
    if (status !== "Occupied") {
        return (
            <div>
                <button className="btn btn-primary" type="submit" onClick={() => seatHandler(tableId)}>Seat here</button>
            </div>
        )
    }
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
        </div>
      </div>
      <div>
        <div>
          <h4>Tables:</h4>
        </div>
        <div>
          {tables.map((table) => (
            // since i need a button on the tables, but i am just calling TableCard, and do not want button on the dashboard, I will just give it a buttom param it is called with
            <TableCard key={table.table_id} table={table} options={button}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeatReservation;
