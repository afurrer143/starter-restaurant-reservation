import React, { useState } from "react";
import { useHistory } from "react-router";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api";
import newTableValidator from "./newTableValidator";

function NewTable({refresh, setRefresh}) {
  const history = useHistory();
  // initial default state for the table
  const initialFormState = {
    table_name: "",
    capacity: "",
  };

  const [newTable, setNewTable] = useState({ ...initialFormState });
  const [error, setError] = useState(null);

  async function submitHandler(event) {
    event.preventDefault();
    const abortController = new AbortController();
    // clear errors before submiting
    setError(null);
    let validateError = await newTableValidator(newTable, setError)
    if (validateError === false) {
        createTable(newTable, abortController.signal)
          .then(async () => {
            await setRefresh(!refresh)
            history.push(`/dashboard`);
          })
          .catch(setError);
        return () => abortController.abort();
    }
  }

  function changeHandler({ target: { name, value } }) {
    setNewTable((previousTable) => ({
      ...previousTable,
      [name]: value,
    }));
  }

  function cancelHandler() {
    return history.goBack();
  }

  return (
    <div>
      <ErrorAlert error={error} />
      <form onSubmit={submitHandler}>
        <fieldset className="mb-2">
          <div className="form-group">
            <label>
              <i className="bi bi-file-person-fill"></i> Table Name:
            </label>
            <input
              type="text"
              className="form-control"
              id="table_name"
              name="table_name"
              placeholder="Name of table"
              required={true}
              value={newTable.table_name}
              onChange={changeHandler}
            />
          </div>
          <label>
            <i className="bi bi-person-lines-fill"></i> Capacity:
          </label>
          <div className="form-group">
            <input
              type="number"
              className="form-control"
              id="capacity"
              name="capacity"
              placeholder="Capacity of table"
              required={true}
              value={newTable.capacity}
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
  );
}

export default NewTable;
