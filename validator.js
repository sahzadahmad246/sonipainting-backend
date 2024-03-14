const { z } = require("zod");

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must not be more than 20 characters" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .refine((value) => /^\d{10}$/.test(value), {
      message: "phone must be 10 digit",
    }),

  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address format" }),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

module.exports =  registerSchema ;