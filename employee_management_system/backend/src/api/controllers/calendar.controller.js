const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const calendarService = require("../../services/calendar.service");

const listEvents = asyncHandler(async (req, res) => {
  const data = await calendarService.listEvents(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, data, "Calendar events fetched"));
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.createEvent(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, event, "Event created"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.updateEvent(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  await calendarService.deleteEvent(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Event deleted"));
});

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
