const express = require("express");

const { getAllEvents, createEvent, updateEvent, deleteEvent, getEventDetails, getEventReviews, deleteReview, getAdminEvents } = require("../controllers/eventController");
const { createEventReview } = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router=express.Router();

router.route("/events").get( getAllEvents);

router.route("/admin/events").get(isAuthenticatedUser, authorizeRoles("admin"),getAdminEvents);

router.route("/admin/event/new").post(isAuthenticatedUser);

router.route("/admin/event/:id").put(isAuthenticatedUser,authorizeRoles("admin"),  updateEvent).delete(isAuthenticatedUser,authorizeRoles("admin"),  deleteEvent)

router.route("/event/:id").get(getEventDetails);

router.route("/review").put(isAuthenticatedUser, createEventReview);

router.route("/reviews").get(getEventReviews).delete(isAuthenticatedUser,deleteReview);


module.exports = router;
