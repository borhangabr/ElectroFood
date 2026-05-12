// Auth service. Pure logic — no Express here.
//
// Controllers call into these functions and translate results to HTTP. The
// only thing that crosses the boundary is structured AppErrors (catch in
// the controller's asyncHandler → centralized middleware).
//
// Simplified to single long-lived access token (no refresh). See cookies.js
// for the rationale.

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAccessToken } = require('../utils/jwt');
const { Conflict, Unauthorized, Forbidden, NotFound } = require('../utils/errors');

const BCRYPT_ROUNDS = 12;

function publicUser(user) {
  // Lightweight projection for the wire. Mongoose toJSON also strips secrets,
  // but spelling it out avoids leaking new fields by accident later.
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    language: user.language,
    addresses: user.addresses || [],
  };
}

function issueToken(user) {
  const claims = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(claims);
  return { accessToken };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new Conflict('Email already in use', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  return { user: publicUser(user), ...issueToken(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.isBlocked) throw new Forbidden('Account is blocked', 'ACCOUNT_BLOCKED');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

  return { user: publicUser(user), ...issueToken(user) };
}

async function logout(_userId) {
  // No server-side token state to clear. Cookie clearing happens in the controller.
  return;
}

async function me(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFound('User not found', 'USER_NOT_FOUND');
  return publicUser(user);
}

module.exports = { register, login, logout, me, publicUser };
