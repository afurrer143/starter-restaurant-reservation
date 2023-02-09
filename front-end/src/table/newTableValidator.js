async function newTableValidator(newTable, setError) {
  setError(null);
  let { table_name, capacity } = newTable;

  newTable.table_name = table_name.trim()
  newTable.capacity = Number(capacity)

  if (table_name === "" || table_name === undefined) {
    setError({ message: `Table name can not be empty.` });
    return true;
  }
  if (table_name.length < 2) {
    setError({ message: `Table name must be at least 2 characters long.` });
    return true;
  }
  if (capacity === "" || capacity === undefined || capacity <= 0) {
    setError({ message: `Capacity can not be empty or a negative number.` });
    return true;
  }

  return false
}

export default newTableValidator;
