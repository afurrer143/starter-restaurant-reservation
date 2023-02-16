import React, { useState } from "react";

import { Redirect, Route, Switch } from "react-router-dom";
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
  const [refresh, setRefresh] = useState(false);

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      {/* I feel like my routes go here */}
      <Route exact={true} path="/reservations/new">
        <NewReservation refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatReservation refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/edit">
        <EditReservation refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route exact={true} path="/tables/new">
        <NewTable refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route exact={true} path="/search">
        <SearchPage refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route path="/dashboard">
        <Dashboard refresh={refresh} setRefresh={setRefresh} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
