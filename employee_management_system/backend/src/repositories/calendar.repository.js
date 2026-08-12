const CalendarEvent = require("../models/calendarEvent.model");

const listByUser = ({ userId, start, end, page = 1, limit = 50 }) => {
  const filter = { user: userId };
  if (start || end) {
    filter.date = {};
    if (start) filter.date.$gte = new Date(start);
    if (end) filter.date.$lte = new Date(end);
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  return Promise.all([
    CalendarEvent.find(filter).sort({ date: 1 }).skip(skip).limit(safeLimit).lean(),
    CalendarEvent.countDocuments(filter),
  ]);
};

const findById = (id, userId) => CalendarEvent.findOne({ _id: id, user: userId }).lean();

const create = (data) => CalendarEvent.create(data);

const update = (id, userId, fields) =>
  CalendarEvent.findOneAndUpdate({ _id: id, user: userId }, fields, { new: true, runValidators: true }).lean();

const remove = (id, userId) => CalendarEvent.findOneAndDelete({ _id: id, user: userId }).lean();

module.exports = { listByUser, findById, create, update, remove };
