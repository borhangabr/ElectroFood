const { z } = require('zod');

// Password rule: 8+ chars, at least one letter and one digit.
// Strict enough to be safe, loose enough not to block users on a prototype.
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long') // bcrypt hard cap
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a digit');

const email = z.string().email().max(254).toLowerCase();

const register = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password,
  }),
};

const login = {
  body: z.object({
    email,
    password: z.string().min(1, 'Password required'),
  }),
};

module.exports = { register, login };
