const reservationService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary"); //only need to use asyncErrorBound on async functions
const tablesController = require("../tables/tables.controller")

// ~~~~~~~~~~~~~~~~~~~~~ MIDDLE WARE ~~~~~~~~~~~~~~~~~~~~~

// array of only the possible valid properties in reservation table
const VALID_RESERVATION_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at",
];

// checks in the current req body ONLy has properties in VALID_RESERVATION_PROPERTIES
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  // loop through req body keys, if any keys are not also in VALID_RESERVATION_PROPERTIES, push it in invalid array
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_RESERVATION_PROPERTIES.includes(field)
  );

  // if invalid field has any length, that means there a property not valid in the request, error out
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

// shamelessly stolen from node-express-sql lesson. Checks if required properties are in req body. And get the required properties we want by calling it in the hasRequiredProperties
function hasProperties(...properties) {
  return function (req, res, next) {
    const { data = {} } = req.body;

    try {
      properties.forEach((property) => {
        if (data[property] === undefined || data[property].length === 0) {
          //specifically testing for undefined cause for example people being 0 would make it falsy and error out here, rather than erroring out on peopleIsValidNumber. and second if statement is regex to remove empty spaces
          const error = new Error(`A '${property}' property is required.`);
          error.status = 400;
          throw error;
        }
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}

// note: does not need the status property I believe. I also believe even in the case these did not exist, postgreSQL would throw an error. But better safe than sorry
const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);


// Function time formatted correctly
function reservation_timeIsTime(req, res, next) {
  let time = req.body.data.reservation_time;
  let timeFormat =
  /^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/; //regex for a format of a time value (allows for seconds to be there too)
  if (timeFormat.test(time)) {
    //if time passes regex test, it is a valid time value
    res.locals.time = time
    return next();
  }
  return next({
    status: 400,
    message: `reservation_time is not formatted correctly in the 24 hour HH:MM format`,
  });
}

// Function people is a number
function peopleIsValidNumber(req, res, next) {
  const people = req.body.data.people;
  if (typeof people !== "number") {
    // if people isnt number, error out
    return next({
      status: 400,
      message: `people must be a number`,
    });
  }
  // check if number is positive, and I could possibly check the number isnt overly big but that could also technicalllly cause problems later on. Who knows maybe some restaurants do have a table for 100 people
  if (people <= 0) {
    return next({
      status: 400,
      message: `people must be a positive number`,
    });
  }
  next();
}

// Get today's date, formatted as only the date, and in central time zone
function getTodayAsFormattedDate() {
  let today = new Date();
  today = today.toLocaleString().split(",")[0]; //when toLocaleString is called with out vari, it defaults to system time (it also has time and split [0] get rids of that)
  return today;
}

// Need to check if date in query, is in past (no good), or is on a tuesday as restaurant is closed that day
function validDateQuery(req, res, next) {
  let date = req.query.date;
  let parsedDate = Date.parse(date); //if date is not valid, it become NaN, and this is pretty versataile on formatting any date format
  // I need to check if there is NOT a date query too, and if not default it to today
  if (!date) {
    res.locals.date = getTodayAsFormattedDate();
    return next();
  } else if (!isNaN(parsedDate)) {
    //so I can not do parsedDate === NaN BUT NaN is not equal to itself...so i can do this
    // this ends up checking if parsed date is recognized by Date.parse as a date
    parsedDate = new Date(parsedDate).toISOString().slice(0, 10); //this is just to format it so it is consistent with everything else
    res.locals.date = parsedDate;
    return next();
  } else {
    // If I get here, it means the date query was not recognized as a date. I am just gonna console and error, and use today as a date value
    if (date !== 'all') {
      console.error(
        `Error on checking date query, reverting to default of today`
        );
    }
      res.locals.date = getTodayAsFormattedDate();
      return next();
    }
  }
  
  // Check if the date reservation is a date
  // OKAY I AM GIVING UP ON DATE BEING VERSATAILLE, IT MUST BE YYYY/MM/DD or YY-MM-DD
  function reservation_dateIsDate(req, res, next) {
    const date = req.body.data.reservation_date;
    let dateFormat = /^(\d{4})(\/|-)(\d{2})\2(\d{2})$/
    // I had to too many errors with different date formats. date MUST BE YYYY-MM-DD
    if (!dateFormat.test(date)) {
      return next({
        status: 400,
        message: `reservation_date is not formatted correctly of YYYY/MM/DD`,
      });
    }
    // if isNaN true, date not formatted right\
    // this will validate the date, like 2023/02/53
    // ...doesnt check for stuff like 2023/02/30 tho, which is a shame
    if (isNaN(Date.parse(date))) {
      return next({
        status: 400,
        message: `reservation_date is not a correct date`,
      });
    }
    next();
  }

  // validate a date is in future and not on a tuesday...this one got messy
  function validDateOnCreate (req, res, next) {
    // So the date class, tries converting to my timezone, and as it defaults to midnight UTC, it rolls back one day.
    // Just add a day with setDate cause nothing else could work
    let dateErrors = []
    let date = req.body.data.reservation_date;
    let today = new Date ()

    let time = res.locals.time //ex :01:30 (it will always be two digits)
    
    let formattedDate = new Date(`${date}T${time}`) //Given 2023-02-25 T 23:59  (remember may need .toLocaleString())
    // console.log(formattedDate.toLocaleString()) //2023-02-25T06:01:00.000Z
    let day = formattedDate.getDay() //get day returns an int 0 to 6. 0 sunday, 6 saturday. So tuesday fittingly will be two

    if (Date.parse(formattedDate) <= Date.parse(today)) {
      // this compare the unix time, so miliseconds from 1974 or something. If they are on the same day, they will be equal so cant be >= but must be >
      dateErrors.push('Requested date must be in the future')
    }
    // when day is 2, its tuesday, restaurant closed that day
  if (day === 2) {
    dateErrors.push('Requested reservation on day restaurant is closed')
  }

  if (dateErrors.length !== 0) {
    next({
      status: 400,
      message: `${dateErrors.join(", ")}`
    })
  }
  return next()
}

// Although not incredibly pratical for the capstone, allows more versatailty if used in prod
function convertTime12to24 (time12h) {

  let [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }

  modifier = modifier.replace(/\./g, ""); //clears any "." in modifier, such as P.M or a.m
  if (modifier.toLowerCase() === 'pm') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
}

// A function to turn a time such as "13:30" to only be a number of its minute values, to allow easy math comparisions
function convertTimeToMinutes (time24h) {
  let [hours, minutes] = time24h.split(':')
  hours = Number(hours) * 60
  let totalTime = hours + Number(minutes)
  return totalTime
}

function validateTimeOnCreate (req, res, next) {
  let openTime = "10:30 AM" //allow plain string to be open and close time with AM PM in it (Note though for this time must have a space between the time and modifier
  let closeTime = "10:30 PM" 
  let MinutesAllowedBeforeClose = 60 

  let time = res.locals.time //time was validated so it is in HH:MM (and optional :SS)
  if (time.length >= 5) { //just to be sure it doesnt mess stuff up clean up time so it is just HH:MM if seconds are there
    time = time.slice(0,5)
  }
  
  let openValue = convertTimeToMinutes(convertTime12to24(openTime)) //converts time to a number for math comparissions
  let closeValue = convertTimeToMinutes(convertTime12to24(closeTime))
  let reservationValue = convertTimeToMinutes(time) //already validated time doesnt have AM or PM

  // if reservation value is less than open value, its before opening
  if (reservationValue < openValue) {
    next ({
      status: 400,
      message: `reservation_time is before opening of ${openTime}`
    })
  }

  if (reservationValue > closeValue - MinutesAllowedBeforeClose) { //I allow MinutesAllowedBeforeClose so code more versatile and allows more options
    next ({
      status: 400,
      message: `reservation_time must be at least ${MinutesAllowedBeforeClose} minutes before we close at ${closeTime}`
    })
  }

  next()
}

// check if the reservation exist by doing a .read, and if it is there, it returns something to reservatipon
async function reservationExist (req, res, next) {
  const reservation = await reservationService.read(req.params.reservation_id)
  if (reservation) {
    res.locals.reservation = reservation
    return next()
  }
  next({
    status: 404,
    message: `reservation with id of ${req.params.reservation_id} not found`
  })
}

function validateReservationStatusOnCreate (req, res, next) {
  let reservationStatus = req.body.data.status;
  if (!reservationStatus) {  
    return next()
  }
  if (reservationStatus.toLowerCase() === "booked") {
    return next()
  }
  return next({
    status: 400,
    message: `reservation status can only be null or booked. Received status of ${reservationStatus}`
  })
}

// can only allow options for booked, seated, and finished
function validateReservationStatusOnUpdate(req, res, next) {
  allowedStatus = ["booked", "seated", "finished"]
  let updatedStatus = req.body.data.status

  if (allowedStatus.includes(updatedStatus)) {
    return next()
  }
  next({
    status: 400,
    message: `Only valid status options are [ ${allowedStatus.join(", ")} ]. Received '${updatedStatus}'`
  })
}

// if the status is finished, it can not be updated, and is essentially archived
function checkIfStatusIsFinished (req, res, next) {
  // Get the current status of the reservation from reservation exists (the .read of :reservation_id)
  let status = res.locals.reservation.status
  if (status === 'finished') {
    return next({
      status: 400,
      message: `status of selected reservation of id: '${req.params.reservation_id}' is 'finished' and can not be updated`
    })
  }
  next()
}

// ~~~~~~~~~~~~~~~~~~~~~ END POINTS ~~~~~~~~~~~~~~~~~~~~~

// list returns entirety of reservation table
// with helper functions above to get reservations on a day
async function list(req, res) {
  const dateQueury = res.locals.date;

  // i wanna also be able to see all reservation if i do ?date=all
  if (req.query.date === "all") {
    //if i wanna see all reservations, can add ?date=all
    const data = await reservationService.list();
    res.json({ data });
  } else {
    // when req query isnt all, we use listOnDate, and we get date query from validDateQuery
    const data = await reservationService.listOnDate(dateQueury);
    res.json({ data });
  }
}

// Create will insert a reservation from the req body data. And it is validated beforehand with middle ware to ensure its valid
async function create(req, res) {
  const data = await reservationService.create(req.body.data);
  res.status(201).json({ data });
}

// Read a single reservation based on reservation id column
async function read(req, res) {
  const data = res.locals.reservation
  res.json({ data })
}

// set the status. Options are "booked, seated, and finished". Since only dealing with status, do not need to validate anything else. Any extra info in req.body wont be used.
// So i need to ALSO update the status of a table at the same time of this, and vice versa when I update a table status(aka seat or deseat one), i need to update reservation status
// so from here I need to get tableId and tableStatus (and reservation_id which I should just have)
// and then on tables seat table, i need to give it reservationStatus some how

// so this happens on clicking "seat" next to a table on the dashboard, so I can get tableId from that
async function setStatus (req, res) {
  let reservationInfo = {
    reservationId: req.params.reservation_id,
    reservationStatus: req.body.data.status
  };
  const data = await reservationService.setStatus(reservationInfo);
  res.json({ data });
}

module.exports = {
  list: [validDateQuery, asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    reservation_dateIsDate,
    reservation_timeIsTime,
    peopleIsValidNumber,
    validateReservationStatusOnCreate,
    validDateOnCreate,
    validateTimeOnCreate,
    asyncErrorBoundary(create),
  ],
  read: [
    asyncErrorBoundary(reservationExist),
    read
  ],
  setStatus: [validateReservationStatusOnUpdate, asyncErrorBoundary(reservationExist), checkIfStatusIsFinished, asyncErrorBoundary(setStatus)]
};
