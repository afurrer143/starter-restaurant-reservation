const reservationService = require("./reservations.service")
const asyncErrorBoundary = require("../errors/asyncErrorBoundary")

// ~~~~~~~~~~~~~~~~~~~~~ MIDDLE WARE ~~~~~~~~~~~~~~~~~~~~~

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
]

// ~~~~~~~~~~~~~~~~~~~~~ END POINTS ~~~~~~~~~~~~~~~~~~~~~

// list returns entirety of reservation table
async function list(req, res) {
  const data = await reservationService.list()
  res.json({ data })
}

// Create will insert a reservation from the req body data. And it is validated beforehand with middle ware to ensure its valid
async function create(req, res){
  const data = await reservationService.create(req.body.data)
  res.status(201).json({ data })
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [asyncErrorBoundary(create)],
};
