import { Link } from "react-router-dom";
import { cancelReservation } from "../utils/api";

function EditAndCancel({ reservation, loadDashboard }) {

  function cancelReservationHandler(reservation, loadDashboard) {
    // so need to have a pop up to confirm, and when cofirmed to a put to /reservations/:reservation_id/status with a status of cancelled (use the setStatys function on reservation from backend.)
    if (window.confirm("Do you want to cancel this reservation?")) {
      const abortController = new AbortController();
      cancelReservation(reservation.reservation_id, abortController.signal)
        .then(loadDashboard)
          // and here i need to refresh the reservation cards some how
        .catch(() => {
          // need some error handler of sorts here
          console.log("ERROR ON CANCELLING RESERVATION")
        })
        return () => abortController.abort();
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
            cancelReservationHandler(reservation, loadDashboard)
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
