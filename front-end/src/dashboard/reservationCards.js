import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { formatAsTime } from "../utils/date-time";
import EditAndCancel from "../EditReservation/editAndCancel";

function ReservationCard({ reservation, loadDashboard }) {
  const location = useLocation().search;
  const dateParameter = new URLSearchParams(location).get("date");

  const [date, setDate] = useState(null);
  const [seatButton, setSeatButton] = useState(null);

  let bgColor = "bg-info";
  if (reservation.status === "booked") {
    bgColor = "bg-light";
  } else if (reservation.status === "seated") {
    bgColor = "bg-success";
  } else if (reservation.status === "cancelled") {
    bgColor = "bg-warning";
  } else if (reservation.status === "finished") {
    bgColor = "bg-info";
  } else {
    bgColor = "bg-danger";
  }

  // by default i do not wanna show the date since they would all be the same normally. Unless I use all
  useEffect(() => {
    if (dateParameter === "all") {
      setDate(`Date: ${reservation.reservation_date}`);
    }
    if (reservation.status === "booked") {
      setSeatButton(
        <div className="col d-flex align-items-center">
          <Link
            to={`/reservations/${reservation.reservation_id}/seat`}
            className="btn btn-primary"
          >
            Seat
          </Link>
        </div>
      );
    }
  }, [
    dateParameter,
    reservation.reservation_date,
    reservation.reservation_id,
    reservation.status,
  ]);

  return (
    <div className={`card  my-3 `}>
      <div className={`card-header d-flex justify-content-between ${bgColor}`}>
        <div>
          <p>
            For {reservation.first_name} {reservation.last_name}
          </p>
        </div>
        <div>
          <p>Time: {formatAsTime(reservation.reservation_time)}</p>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-9">
            <p
              className="card-text"
              data-reservation-id-status={reservation.reservation_id}
            >
              Status: <span>{reservation.status}</span>
            </p>
            <p className="card-text">
              Phone Number: {reservation.mobile_number}
            </p>
            <p className="card-text">Party Size: {reservation.people}</p>
            <p className="card-text">{date}</p>
          </div>
          {seatButton}
        </div>
        <div>
          <EditAndCancel
            reservation={reservation}
            loadDashboard={loadDashboard}
          />
        </div>
        <br />
      </div>
    </div>
  );
}

export default ReservationCard;
