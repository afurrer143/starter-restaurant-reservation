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
        if (data[property] === undefined || data[property].length === 0) { //specifically testing for undefined cause for example people being 0 would make it falsy and error out here, rather than erroring out on peopleIsValidNumber. and second if statement is regex to remove empty spaces
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

// Check if the date reservation is a date
function reservation_dateIsDate (req, res, next) {
  const date = req.body.data.reservation_date
  let parsedDate = Date.parse(date) //if date is not valid, it become NaN, and this is pretty versataile on formatting any date format
  // OKAY so I can not do parsedDate === NaN BUT NaN is not equal to itself...so i can do this
  if (parsedDate !== parsedDate) {
    return next({
      status: 400,
      message: `reservation_date is not formatted correctly`,
    });
  } 
  next()
}

// Function time formatted correctly
function reservation_timeIsTime (req, res, next) {
  let time = req.body.data.reservation_time
  let timeFormat = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9](\.[0-9]{3})?)?\s?(AM|am|PM|pm)?$/ //regex for a format of a time value
  // probably went over kill on the reg ex. post SQL can accept a PM/AM or pm/am at end and convert. but not a p.m or P.M
  if (timeFormat.test(time)) { //if time passes regex test, it is a valid time value
    return next()
  }
  return next({
    status: 400,
    message: `reservation_time is not formatted correctly`,
  });
}

// Function people is a number
function peopleIsValidNumber (req, res, next) {
  const people = req.body.data.people
  if (typeof people !== "number") { // if people isnt number, error out
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
  next()
}

// Check if the date reservation is a date
function validDateQuery (date) {
  let parsedDate = Date.parse(date) //if date is not valid, it become NaN, and this is pretty versataile on formatting any date format
  // OKAY so I can not do parsedDate === NaN BUT NaN is not equal to itself...so i can do this
  if (parsedDate !== parsedDate) {
    // if parsed date in query is not date format, just return false and that will force list query to default to today
    return false
  } 
  return true
}

// ~~~~~~~~~~~~~~~~~~~~~ END POINTS ~~~~~~~~~~~~~~~~~~~~~

// list returns entirety of reservation table
// list also needs a thing if there a date param in url, it shows only reservations on that date
async function list(req, res) {
  const dateQueury = req.query.date 

  if (dateQueury === "all") { //if i wanna see all reservations, can add ?date=all
    const data = await reservationService.list();
    res.json({ data });
  }
  //it may need to be changed but even on ?date= it will be equal to null, which is falsy
  else if (validDateQuery(dateQueury)) { //when date queury is valid date format, will get reservations on that day
    // toLocaleString returns "1/31/2023, 11:04:05 AM" format. So I can just split and return index0 for date
    let formattedDate = new Date(Date.parse(dateQueury)).toLocaleString('en-US', {timeZone: 'CST',}).split(',')[0] 
    const data = await reservationService.listOnDate(formattedDate)
    res.json({ data })
  }
  else {
    // so when date query is either not specified or incorrect format show reservations for today
    let today = new Date().toLocaleString('en-US', {timeZone: 'CST',}).split(',')[0] 
    const data = await reservationService.listOnDate(today)
    res.json({ data })
  }
}

// Create will insert a reservation from the req body data. And it is validated beforehand with middle ware to ensure its valid
async function create(req, res) {
  const data = await reservationService.create(req.body.data);
  res.status(201).json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [hasOnlyValidProperties, hasRequiredProperties, reservation_dateIsDate, reservation_timeIsTime, peopleIsValidNumber, asyncErrorBoundary(create)],
};
