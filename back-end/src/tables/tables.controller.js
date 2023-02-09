const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary"); //only need to use asyncErrorBound on async functions
const reduceProperties = require("../utils/reduce-properties");
const reservationService = require("../reservations/reservations.service");
const setReservationStatusAndSeatTable = require("../knexTransactions/setStatusAndSeatTable")


// Used to format response to RESTFUL
const reduceTablesAndReservation = reduceProperties("table_id", {
  reservation_id: ["reservationInfo", "reservation_id"],
  first_name: ["reservationInfo", "first_name"],
  last_name: ["reservationInfo", "last_name"],
  mobile_number: ["reservationInfo", "mobile_number"],
  reservation_date: ["reservationInfo", "reservation_date"],
  reservation_time: ["reservationInfo", "reservation_time"],
  people: ["reservationInfo", "people"],
  status: ["reservationInfo", "reservation_status"],
});
// ~~~~~~~~~~~~~~~~~~~~~ MIDDLE WARE ~~~~~~~~~~~~~~~~~~~~~

// array of only the possible valid properties in reservation table
const VALID_TABLE_PROPERTIES = [
  "table_name",
  "capacity",
  "status",
  "reservation_id",
  "created_at",
  "updated_at",
];

// checks in the current req body ONLy has properties in VALID_TABLE_PROPERTIES
function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  // loop through req body keys, if any keys are not also in VALID_RESERVATION_PROPERTIES, push it in invalid array
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_TABLE_PROPERTIES.includes(field)
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

// Properties that ARE required. Ex: status and reservation ID are not necessary
const hasRequiredPropertiesOnCreate = hasProperties("table_name", "capacity");

// Validate the table name, and in this case just making sure it isnt empty and is at least 2 character long (2 minimumum)
//To note: table names must be unique according to table, so will error if name is used already
function validateTableName(req, res, next) {
  const tableName = req.body.data.table_name;
  if (tableName.length < 2) {
    return next({
      status: 400,
      message: `table_name must be at least 2 characters long`,
    });
  }
  next();
}

function validateCapacityIsNumber(req, res, next) {
  const capacity = req.body.data.capacity;
  // react sends even numbers as strings, so test it with isNaN
  if (typeof capacity !== "number") {
    return next({
      status: 400,
      message: `capacity must be a number`,
    });
  }
  // validate capacity greater than 0
  if (capacity <= 0) {
    return next({
      status: 400,
      message: `capacity must be greater than zero`,
    });
  }
  next();
}

async function validateNameIsUnique(req, res, next) {
  const name = req.body.data.table_name
  // searches DB based on the name, which should be unique
  const table = await tablesService.readByName(name);
  if (table) {
    return next({
      status:400,
      message: `Table with name of ${name} already exists, and all table names must be unique`
    })
  }
  next()
}

function hasDataWhenSeating(req, res, next) {
  if (!req.body.data) {
    return next({
      status: 400,
      message: `no data detected when attempting to seat table`,
    });
  }
  next();
}

// just some basic validation of table id in req params, like is number
function tableIdInParamsIsNumber(req, res, next) {
    // realisitcally this one is imposibble to fail since read is only on /tables/:table_id, but hey you never know
  if (!req.params.table_id) {
    return next({
      status: 400,
      message: `An id in request parameters was not detected`,
    });
  }
  let tableId = req.params.table_id;
  if (Number(tableId) <= 0 || isNaN(Number(tableId))) {
    return next({
      status: 400,
      message: `id was either less than 0, or is not a number. Received id of ${tableId}`,
    });
  }
  next();
}

// check if the table exist by doing a .read, and if it is there, it returns something to reservatipon
async function tableExist(req, res, next) {
  const table = await tablesService.read(req.params.table_id);

  if (table.length) {
    //Note i am not using reduceTablesAndReservation on this, so in JS it is one object. So res.locals.table.mobile_number will return info
    // as opposed if i did format it, it would need to do res.locals.table.reservationInfo.mobile_number
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `table with id of ${req.params.table_id} not found`,
  });
}

// for seating a table, after I validate table exists, I need validate the info attempting to be put in the table
async function validateReservationId(req, res, next) {
  // so first reservation id must be in the req.body
  // and beyond that, i need to verify that a reservation matches that Id
  
  //I need to validate the req.body has resvId, cause if I do just on res.locals.table it could have a reservation ID, and this function/ test is for SEATING empty tables only
  if (!req.body.data.reservation_id) {
    return next({
      status: 400,
      message: `reservation_id is required to seat a table`,
    });
  }
  let reservationId = req.body.data.reservation_id;
  //   Then I need to validate that the reservation id in req.body also exists in the reservations table
  let foundReservationId = await reservationService.read(reservationId);
  if (!foundReservationId) {
    return next({
      status: 404,
      message: `Could not find a reservation with id of ${reservationId}`,
    });
  }
  res.locals.currentReservation = foundReservationId;
  next();
}

// used in seating a table, if table is seated, can not seat again
function checkIfReservationNotSeated(req, res, next) {
    let reservation = res.locals.currentReservation
    if (reservation.status === "seated") {
        return next({
            status:400,
            message: `current reservation of id '${reservation.reservation_id}' is already seated`
        })
    }
    next()
}

function validateCapacityOnSeating(req, res, next) {
  // since i need the res.locals.tables as array for reduce, gotta do that to return just object
  let table = res.locals.table[0];
  let reservation = res.locals.currentReservation;
  let { capacity } = table;
  let { people } = reservation;
  if (capacity < people) {
    return next({
      status: 400,
      message: `selected table of ${table.table_name} with an id of: ${table.table_id} can not seat ${people} people, tables has capacity of ${capacity} seats`,
    });
  }
  next();
}

function tableIsFree(req, res, next) {
  let table = res.locals.table[0];
  if (table.table_status === "Occupied") {
    return next({
      status: 400,
      message: `selected table of ${table.table_name} with an id of: ${table.table_id} is currently occupied and can not be seated current`,
    });
  }
  next();
}

function tableIsOccupied(req, res, next) {
  let table = res.locals.table[0];
  if (table.table_status === "Free") {
    return next({
      status: 400,
      message: `selected table of ${table.table_name} with an id of: ${table.table_id} is currently not occupied and can not be emptied`,
    });
  }
  next();
}

// ~~~~~~~~~~~~~~~~~~~~~ END POINTS ~~~~~~~~~~~~~~~~~~~~~

async function list(req, res, next) {
  const data = await tablesService.list();
  res.json({ data });
}

async function create(req, res, next) {
  const data = await tablesService.create(req.body.data);
  res.status(201).json({ data });
}

// formatted with reduceTables so reservation info is in its own sub array/ obj
async function read(req, res) {
  const data = res.locals.table;
  //since I need an array to use .reduce it will return an array
  res.json({ data: reduceTablesAndReservation(data)[0] });
}

// Allows a .put in the tables table on a table id.
// So the ONLY thing in req.body, is reservation ID. We get table Id from req.params
// and all I wanna do on seat, is change the reservation ID and status

// So on seat table, I need to ALSO change status on reservation, using the function setStatus (and on seating table it will always be status "seated") and later on emptyATable, I must set status to finished
// I can use knex transaction to do seatTable and setStatus
async function seatTableAndSetStatus (req, res) {
    let tableAndReservationInfo = {
        reservationId: req.body.data.reservation_id,
        newReservationId: req.body.data.reservation_id,
        reservationStatus: "seated",
        tableId: req.params.table_id,
        tableStatus: "Occupied",
    }
    const data = await setReservationStatusAndSeatTable(tableAndReservationInfo)
    res.json(data)
}

async function emptyATableAndSetStatus(req, res) {

    let emptiedTableAndReservationInfo = {
        reservationId: res.locals.table[0].reservation_id,
        newReservationId: null,
        reservationStatus: "finished",
        tableId: req.params.table_id,
        tableStatus: "Free",
    };
    const data = await setReservationStatusAndSeatTable(emptiedTableAndReservationInfo)
    res.json(data);
    //   the e2e testing check the db, so it needs a .get, but i am pretty sure that is react sided
  }
  

// so even EmptyATable is on a .delete, and while I doubt I should delete the entire table row, just delete reservation id table_status
// probably just gonna do a .put
//   the e2e testing check the db, so it needs a .get, but i am pretty sure that is react sided



module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredPropertiesOnCreate,
    validateTableName,
    validateCapacityIsNumber,
    validateNameIsUnique,
    asyncErrorBoundary(create),
  ],
  read: [tableIdInParamsIsNumber, asyncErrorBoundary(tableExist), read],
  seatTable: [
    hasDataWhenSeating,
    asyncErrorBoundary(validateReservationId),
    checkIfReservationNotSeated,
    asyncErrorBoundary(tableExist),
    validateCapacityOnSeating,
    tableIsFree,
    seatTableAndSetStatus,
  ],
  emptyATable: [
    asyncErrorBoundary(tableExist),
    tableIsOccupied,
    emptyATableAndSetStatus,
  ],
};
