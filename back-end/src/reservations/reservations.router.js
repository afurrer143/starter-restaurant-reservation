/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */


// so for create reservation. Frond end will end up doing a .post here
const router = require("express").Router({ mergeParams: true });
const controller = require("./reservations.controller");

router.route("/").get(controller.list).post(controller.create);
router.route("/:reservation_id").get(controller.read)
router.route("/:reservation_id/status").put(controller.setStatus)
router.route("/:reservation_id/edit").put(controller.update)

module.exports = router;
