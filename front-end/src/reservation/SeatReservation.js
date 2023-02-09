import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router";
import { readReservations, listTables } from "../utils/api";
import { formatAsTime } from "../utils/date-time";
import TableCard from "../dashboard/TableCards";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const [readReservation, setReadReservations] = useState({});
  const [readReservationsError, setReadReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  const routeMatch = useRouteMatch();
  let reservationId = routeMatch.params.reservation_id;
  // so i should get a way, to get the current reservation in here.
  // I also need all tables here too
  // but SeatReservation is called in routes, With no params
  // And tables and reservations are made in dashboard.js
  // It would be so nice, if i could just call this component in DashBoard. But even adding Switch and Routs it did not work...but maybe there is some way...I hope
  // I think i am just gonna make a read function. I mean i already made one in backend so may as well use it
  useEffect(loadReservation, []);

  function loadReservation() {
    const abortController = new AbortController();
    setReadReservationsError(null);
    readReservations(reservationId, null, abortController.signal)
      .then(setReadReservations)
      .catch(setReadReservationsError);

    listTables(abortController.signal).then(setTables).catch(setTablesError);

    return () => abortController.abort();
  }

  console.log(readReservation);

  //   need to test if readReservation has finished, other wise {formatAsTime(readReservation.reservation_time) will crash the program since time will be undefined
  if (JSON.stringify(readReservation) === "{}") {
    return (
      <div>
        <ErrorAlert error={readReservationsError} />
      </div>
    );
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
            <TableCard key={table.table_id} table={table} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeatReservation;
