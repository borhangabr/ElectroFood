// Auth service. Pure logic — no Express here.
//
// Controllers call into these functions and translate results to HTTP. The
// only thing that crosses the boundary is structured AppErrors (catch in
// the controller's asyncHandler → centralized middleware).

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} = require('../utils/jwt');
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

async function issueTokenPair(user) {
  const claims = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(claims);
  const refreshToken = signRefreshToken(claims);
  // Persist the hash so we can detect reuse / invalidate on logout.
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new Conflict('Email already in use', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  const tokens = await issueTokenPair(user);
  return { user: publicUser(user), ...tokens };
}

async function login({ email, password }) {
  // Need passwordHash + refreshTokenHash → can't .lean() here.
  const user = await User.findOne({ email }).select('+refreshTokenHash');
  if (!user) throw new Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.isBlocked) throw new Forbidden('Account is blocked', 'ACCOUNT_BLOCKED');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

  const tokens = await issueTokenPair(user);
  return { user: publicUser(user), ...tokens };
}

async function logout(userId) {
  // Best-effort: clear server-side hash so a stolen refresh token can't be used.
  await User.updateOne({ _id: userId }, { $set: { refreshTokenHash: null } });
}

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) throw new Unauthorized('Missing refresh token', 'MISSING_REFRESH');

  let claims;
  try {
    claims = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new Unauthorized('Invalid or expired refresh token', 'INVALID_REFRESH');
  }

  const user = await User.findById(claims.sub).select('+refreshTokenHash');
  if (!user) throw new Unauthorized('User no longer exists', 'USER_GONE');
  if (user.isBlocked) throw new Forbidden('Account is blocked', 'ACCOUNT_BLOCKED');

  // Token-reuse detection: the presented token must hash to the one we stored.
  // If it doesn't, treat as theft — wipe the hash so any holder must re-login.
  const presentedHash = hashRefreshToken(rawRefreshToken);
  if (!user.refreshTokenHash || user.refreshTokenHash !== presentedHash) {
    user.refreshTokenHash = null;
    await user.save();
    throw new Unauthorized('Refresh token mismatch', 'REFRESH_REUSE');
  }

  const tokens = await issueTokenPair(user); // rotates the hash
  return { user: publicUser(user), ...tokens };
}

async function me(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFound('User not found', 'USER_NOT_FOUND');
  return publicUser(user);
}

module.exports = { register, login, logout, refresh, me, publicUser };
