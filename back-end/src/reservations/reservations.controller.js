const reservationService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary"); //only need to use asyncErrorBound on async functions

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
  /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9](\.[0-9]{3})?)?\s?(AM|am|PM|pm)?$/; //regex for a format of a time value
  // probably went over kill on the reg ex. post SQL can accept a PM/AM or pm/am at end and convert. but not a p.m or P.M
  if (timeFormat.test(time)) {
    //if time passes regex test, it is a valid time value
    return next();
  }
  return next({
    status: 400,
    message: `reservation_time is not formatted correctly`,
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
  today = today.toLocaleString("en-US", { timeZone: "CST" }).split(",")[0];
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
    console.error(
      `Error on checking date query, reverting to default of today`
      );
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
        message: `reservation_date is not formatted correctly`,
      });
    }
    let dateClass = new Date(date)
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

  function addADayCauseJSKeepsConvertingToMyTimeZoneAndLosingADay(date) {
    let result = new Date(date);
    result.setDate(result.getDate() + 1);
    return result;
  }

  // validate a date is in future and not on a tuesday...this one got messy
  function validDateOnCreate (req, res, next) {
    // So a date to ISOstring, is at UTC, i however can not use getDays or other date functions on it. And any date object is converted to my timezone (and since the dates dont have a time specified, they default to midnight, and so when they get converted, they roll back a day)
    let dateErrors = []
    let date = req.body.data.reservation_date;
    let today = new Date ()
 
    let datePlusOne = addADayCauseJSKeepsConvertingToMyTimeZoneAndLosingADay(date)

    let day = datePlusOne.getDay()
    if (today.setHours(0, 0, 0, 0) > datePlusOne.setHours(0, 0, 0, 0)) {
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

module.exports = {
  list: [validDateQuery, asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    reservation_dateIsDate,
    reservation_timeIsTime,
    peopleIsValidNumber,
    validDateOnCreate,
    asyncErrorBoundary(create),
  ],
};
