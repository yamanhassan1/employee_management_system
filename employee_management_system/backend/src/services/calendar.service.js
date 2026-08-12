const mongoose = require("mongoose");
const calendarRepo = require("../repositories/calendar.repository");
const ApiError = require("../utils/apiError");

const listEvents = async (userId, query) => {
  const [items, total] = await calendarRepo.listByUser({ userId, ...query });
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const createEvent = async (userId, body) => {
  const { title, description, date, type, task } = body;
  if (!title?.trim()) throw new ApiError(422, "Title is required");
  if (!date) throw new ApiError(422, "Date is required");
  return calendarRepo.create({
    user: userId,
    title: title.trim(),
    description: description || "",
    date: new Date(date),
    type: type || "other",
    task: task || null,
  });
};

const updateEvent = async (userId, eventId, body) => {
  if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event id");
  const fields = {};
  if (body.title !== undefined) {
    if (!body.title.trim()) throw new ApiError(422, "Title cannot be empty");
    fields.title = body.title.trim();
  }
  if (body.description !== undefined) fields.description = body.description;
  if (body.date !== undefined) fields.date = new Date(body.date);
  if (body.type !== undefined) fields.type = body.type;
  if (body.task !== undefined) fields.task = body.task;

  const updated = await calendarRepo.update(eventId, userId, fields);
  if (!updated) throw new ApiError(404, "Event not found");
  return updated;
};

const deleteEvent = async (userId, eventId) => {
  if (!mongoose.isValidObjectId(eventId)) throw new ApiError(400, "Invalid event id");
  const deleted = await calendarRepo.remove(eventId, userId);
  if (!deleted) throw new ApiError(404, "Event not found");
  return deleted;
};

module.exports = { listEvents, createEvent, updateEvent, deleteEvent };
