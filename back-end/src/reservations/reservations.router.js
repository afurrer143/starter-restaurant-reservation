/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */


// so for create reservation. Frond end will end up doing a .post here
const router = require("express").Router();
const controller = require("./reservations.controller");

router.route("/").get(controller.list);

module.exports = router;
