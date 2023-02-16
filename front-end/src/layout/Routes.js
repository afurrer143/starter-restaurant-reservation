import React, { useEffect, useState } from "react";

import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { listReservations, listTables } from "../utils/api";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import NewReservation from "../reservation/newReservation";
import NewTable from "../table/newTable";
import SeatReservation from "../reservation/SeatReservation";
import SearchPage from "../Search/SearchPage";
import { today } from "../utils/date-time";
import EditReservation from "../EditReservation/EditReservation";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [date, setDate] = useState("");
  const location = useLocation().search;
  const dateParameter = new URLSearchParams(location).get("date");

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
    listTables(abortController.signal).then(setTables).catch(setTablesError);

    return () => abortController.abort();
  }

  useEffect(loadDashboard, [date, dateParameter]);
   // so currently reservations is an array of all my reservations matching date paramenter (defaulted to today)

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations/new">
        <NewReservation loadDashboard={loadDashboard} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatReservation loadDashboard={loadDashboard} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/edit">
        <EditReservation loadDashboard={loadDashboard} />
      </Route>
      <Route exact={true} path="/tables/new">
        <NewTable loadDashboard={loadDashboard} />
      </Route>
      <Route exact={true} path="/search">
        <SearchPage loadDashboard={loadDashboard} />
      </Route>
      <Route path="/dashboard">
        <Dashboard
          loadDashboard={loadDashboard}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tablesError={tablesError}
          setTablesError={setTablesError}
          date={date}
        />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
