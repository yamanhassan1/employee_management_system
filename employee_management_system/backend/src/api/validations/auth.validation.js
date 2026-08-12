const { z } = require("zod");

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, "Name is too short"),
      email: z.string().email("Invalid email"),
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password"),
      // role is NOT accepted from public registration; always defaults to employee server-side
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
    deviceId: z.string().min(1, "deviceId is required").optional().or(z.literal("")),
  }),
});

module.exports = { registerSchema, loginSchema };
