import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { formatAsTime } from "../utils/date-time";

function ReservationCard({ reservation }) {
  const location = useLocation().search;
  const dateParameter = new URLSearchParams(location).get("date");

  const [date, setDate] = useState(null);
  // by default i do not wanna show the date since they would all be the same normally. Unless I use all
  useEffect(() => {
    if (dateParameter === "all") {
      setDate(`Date: ${reservation.reservation_date}`);
    }
  }, [dateParameter, reservation.reservation_date]);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
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
            <p className="card-text">Status: {reservation.status}</p>
            <p className="card-text">
              Phone Number: {reservation.mobile_number}
            </p>
            <p className="card-text">Party Size: {reservation.people}</p>
            <p className="card-text">{date}</p>
          </div>
          <div className="col d-flex align-items-center">
            <Link to={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">Seat them</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationCard;
