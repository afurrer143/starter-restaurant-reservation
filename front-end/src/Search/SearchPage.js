import React, { useState } from "react";
import { useHistory } from "react-router";
import ReservationCard from "../dashboard/reservationCards";
import ErrorAlert from "../layout/ErrorAlert";
import { searchReservationsByPhone } from "../utils/api";

function SearchPage({ loadDashboard }) {
  // so it needs to stay on the url, and show the reservation matching number here using Table Card used in dashboard (table card is made from .map reservations, so here i get resv mathcing numb, put in array and use table Card again)
  const [phoneNumberSearch, setPhoneNumberSearch] = useState("");
  const [foundReservation, setFoundReservations] = useState([]);
  const [noneFound, setNoneFound] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const history = useHistory();

  function changeHandler(event) {
    setPhoneNumberSearch(event.target.value);
  }

  async function submitHandler(event) {
    event.preventDefault();
    // if phone number search is empty, throw an error on gotta have a number (added cause for some reason if it was blank it would show cancelled reservations)
    if (phoneNumberSearch.trim() === "") {
      setSearchError({message: "Must input a number"})
      setFoundReservations([]);
    } else {
      const abortController = new AbortController();
      setSearchError(null);
      await searchReservationsByPhone(phoneNumberSearch, abortController.signal)
        .then((value) => {
          if (value.length === 0) {
            setFoundReservations([]);
            setNoneFound("No reservations found");
          } else {
            setFoundReservations(value);
            setNoneFound(null);
          }
        })
        .catch(setSearchError);
      return () => abortController.abort();
    }
  }

  function cancelHandler() {
    return history.goBack();
  }
  return (
    <div>
      <div>
        <ErrorAlert error={searchError} />
      </div>
      <div className="search-header">
        <div>
          <form onSubmit={submitHandler}>
            <fieldset className="mb-2">
              <div className="form-group">
                <label>
                  <i className="bi bi-telephone-fill"></i> Phone Number:
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="mobile_number"
                  name="mobile_number"
                  placeholder="Enter a customer's phone number"
                  required
                  value={phoneNumberSearch}
                  onChange={(event) => changeHandler(event)}
                />
              </div>
            </fieldset>
          </form>
        </div>
        <div className="col-auto">
          <button
            type="submit"
            className="btn btn-primary mr-2"
            onClick={submitHandler}
          >
            <i className="bi bi-check-lg"></i> Submit
          </button>
          <button
            type="button"
            className="btn btn-secondary mr-2"
            onClick={cancelHandler}
          >
            <i className="bi bi-x-lg"></i> Cancel
          </button>
        </div>
      </div>
      <br />
      <div className="found-reservations">
        {foundReservation.map((reservation) => (
          <ReservationCard
            key={reservation.reservation_id}
            reservation={reservation}
          />
        ))}
      </div>
      <div>
        <h3>{noneFound}</h3>
      </div>
    </div>
  );
}

export default SearchPage;
