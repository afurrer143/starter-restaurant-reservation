async function newReservationValidator(newReservation, setError) {
  setError(null);

  // since i wanna use this in edit which has the entire reservation info, i need to first filter out the excess information. Such as "created_at" or even reservation_id

  const desiredKeys = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  const filteredObject = Object.keys(newReservation)
    .filter((key) => desiredKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = newReservation[key];
      return obj;
    }, {});



  for (let element in filteredObject) {
    if (element === "people") {
      // .trim can mess up on not strings, so not even gonna try trimming it
      newReservation[element] = Number(newReservation[element]);
    } else {
      newReservation[element] = newReservation[element].trim();
    }
  }

  let {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
  } = newReservation;
  // So I need basic validation and formatting here (mainly format people)

  //   I tried so hard to make a basic validating function to keep code DRY, and it just did not work. So we get this instead
  if (first_name === "" || first_name === undefined) {
    setError({ message: `First name can not be empty.` });
    return true;
  }
  if (last_name === "" || last_name === undefined) {
    setError({ message: `Last name can not be empty.` });
    return true;
  }
  if (mobile_number === "" || mobile_number === undefined) {
    setError({ message: `Phone number can not be empty.` });
    return true;
  }
  if (people === "" || people === undefined || people <= 0) {
    setError({
      message: `Number of people can not be empty or a negative number.`,
    });
    return true;
  }
  if (reservation_date === "" || reservation_date === undefined) {
    setError({ message: `Reservation date can not be empty.` });
    return true;
  }
  if (reservation_time === "" || reservation_time === undefined) {
    setError({ message: `Reservation time can not be empty.` });
    return true;
  }

  let phoneFormat = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
  if (!phoneFormat.test(mobile_number)) {
    setError({
      message: `Phone number not recognized. Try a (555) 555 5555 fomat.`,
    });
    return true;
  }

  //  if we get here, all if statements didnt run, and just return false
  return false;
}

export default newReservationValidator;
