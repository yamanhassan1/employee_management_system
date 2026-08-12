const ApiError = require("../../utils/apiError");

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    // zod v4 uses `issues`; zod v3 uses `errors`. Support both.
    const issues = result.error.issues || result.error.errors || [];
    const errors = issues.map((e) => ({ field: e.path.join("."), message: e.message }));
    return next(new ApiError(422, "Validation failed", errors));
  }
  next();
};

module.exports = validateRequest;