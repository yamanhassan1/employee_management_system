const { z } = require("zod");

const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email("Invalid email") }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

module.exports = { forgotPasswordSchema, resetPasswordSchema };