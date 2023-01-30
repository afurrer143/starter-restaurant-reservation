const reservationService = require("./reservations.service")
/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const data = await reservationService.list()
  res.json({ data })
}

async function create(req, res){
  
}

module.exports = {
  list,
};
