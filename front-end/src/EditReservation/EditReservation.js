import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import { editReservation, readReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import newReservationValidator from "../reservation/newReservationValidator";
import ReservationFormComponent from "../reservation/reservationForm";

function EditReservation({loadDashboard}) {
  const history = useHistory();
  const routeMatch = useRouteMatch();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  const [newReservation, setNewReservation] = useState({ ...initialFormState });
  const [error, setError] = useState(null);

  useEffect(loadReservation, [routeMatch.params.reservation_id]);

  function loadReservation() {
    const abortController = new AbortController();
    setError(null);
    let reservationId = routeMatch.params.reservation_id;
    readReservations(reservationId, null, abortController.signal)
      .then(setNewReservation)
      .catch(setError);
  }

  async function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();
    setError(null);
    let reservationId = routeMatch.params.reservation_id;
    let validateError = await newReservationValidator(newReservation, setError)
    if (validateError === false) {
        editReservation(reservationId, newReservation, abortController.signal)  
            .then(() => {
                let date = newReservation.reservation_date;
                history.push(`/dashboard?date=${date}`);
            })
            .catch(setError)
    }


  }

  if (!newReservation.reservation_id) {
    return <h2>Loading</h2>;
  }

  return (
    <div>
      <ErrorAlert error={error} />
      <ReservationFormComponent newReservation={newReservation} setNewReservation={setNewReservation} submitHandler={submitHandler} />
    </div>
  );
}

export default EditReservation;
