import React, { useState } from "react";
import { useHistory } from "react-router";

import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";
import newReservationValidator from "./newReservationValidator";
import ReservationFormComponent from "./reservationForm";

function NewReservation({loadDashboard}) {
  const history = useHistory()
  
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

  async function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();
    // clear error on each submit
    setError(null);
    let validateError = await newReservationValidator(newReservation, setError)
    if (validateError === false) {
        createReservation(newReservation, abortController.signal)
          .then(() => {
            //Need to redirect to dashboard, for the date of the reservation
            // GONNA TRY GETTING RID OF LOAD HERE AND SEE WHATHAPPENS
            // loadDashboard()
            let date = newReservation.reservation_date;
            history.push(`/dashboard?date=${date}`);
          })
          .catch(setError);
        return () => abortController.abort();
    }
  }

  return (
    <div>
      <ErrorAlert error={error} />
      <ReservationFormComponent 
      newReservation={newReservation} 
      setNewReservation={setNewReservation} 
      submitHandler={submitHandler} />
    </div>
  );
}

export default NewReservation;
