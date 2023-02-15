import { Link } from "react-router-dom";
import { cancelReservation } from "../utils/api";

function EditAndCancel({ reservation, refresh, setRefresh }) {

  function cancelReservationHandler(reservation, refresh, setRefresh) {
    // so need to have a pop up to confirm, and when cofirmed to a put to /reservations/:reservation_id/status with a status of cancelled (use the setStatys function on reservation from backend.)
    if (window.confirm("Do you want to cancel this reservation?")) {
      const abortController = new AbortController();
      cancelReservation(reservation.reservation_id, abortController.signal)
        .then(() => {
          // and here i need to refresh the reservation cards some how
          setRefresh(!refresh);
        })
        .catch(() => {
          // need some error handler of sorts here
        });
    }
  }

  if (reservation.status !== "booked") {
    return null;
  } else {
    return (
      <div className="d-flex">
        <Link
          to={`/reservations/${reservation.reservation_id}/edit`}
          className="btn btn-primary mx-2"
        >
          Edit
        </Link>
        <button
          className="btn btn-secondary mx-2"
          onClick={() =>
            cancelReservationHandler(reservation, refresh, setRefresh)
          }
          data-reservation-id-cancel={reservation.reservation_id}
        >
          Cancel
        </button>
      </div>
    );
  }
}

export default EditAndCancel;
