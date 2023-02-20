import { useHistory } from "react-router";
import React from "react";

function ReservationFormComponent({newReservation, setNewReservation, submitHandler}) {

    const history = useHistory()
    
      function changeHandler({ target: { name, value } }) {
        setNewReservation((previousReservation) => ({
          ...previousReservation,
          [name]: value,
        }));
      }
    
      function cancelHandler() {
        return history.goBack();
      }

  return (
    <div>
      <div className="container-md">
      <form onSubmit={submitHandler}>
        <fieldset className="mb-2">
          <div className="form-group">
            <label>
              <i className="bi bi-file-person-fill"></i> First Name:
            </label>
            <input
              type="text"
              className="form-control"
              id="first_name"
              name="first_name"
              placeholder="Your First Name"
              required={true}
              value={newReservation.first_name}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-file-person-fill"></i> Last Name:
          </label>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="last_name"
              name="last_name"
              placeholder="Your Last Name"
              required={true}
              value={newReservation.last_name}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-telephone-fill"></i> Phone Number:
          </label>
          <div className="form-group">
            <input
              type="tel"
              className="form-control"
              id="mobile_number"
              name="mobile_number"
              placeholder="(555)-555-5555"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              required={true}
              value={newReservation.mobile_number}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-person-plus-fill"></i> How Many People:
          </label>
          <div className="form-group">
            <input
              type="number"
              className="form-control"
              id="people"
              name="people"
              placeholder="How many people will be joining you"
              required={true}
              value={newReservation.people}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-calendar-date-fill"></i> Date You Wish To Make A
            Reservation On:
          </label>
          <div className="form-group">
            <input
              type="date"
              className="form-control"
              id="reservation_date"
              name="reservation_date"
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              required={true}
              value={newReservation.reservation_date}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-clock-fill"></i> Time Of The Reservation You
            Wish For:
          </label>
          <div className="form-group">
            <input
              type="time"
              className="form-control"
              id="reservation_time"
              name="reservation_time"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              required={true}
              value={newReservation.reservation_time}
              onChange={changeHandler}
            />
          </div>
        </fieldset>
      </form>
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
    </div>
  );
}

export default ReservationFormComponent