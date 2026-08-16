/* ============================================================
   scripts/seedAdmin.js — one-time CLI script to create the first admin
   account. Run manually, not exposed via any HTTP route.

   Usage:
     node scripts/seedAdmin.js --name "Admin Name" --username admin \
       --email admin@biorank.app --password "somePassword123"

   Safe to re-run: if a user with that email/username already exists,
   it will promote them to admin instead of creating a duplicate
   (useful if you signed up normally first, then want to promote
   yourself instead of typing everything twice).
   ============================================================ */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    out[key] = args[i + 1];
  }
  return out;
}

async function main() {
  const { name, username, email, password } = parseArgs();

  if (!name || !username || !email || !password) {
    console.error(
      'Usage: node scripts/seedAdmin.js --name "Full Name" --username someuser ' +
      '--email admin@example.com --password "yourPassword"'
    );
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  let user = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  const passwordHash = await bcrypt.hash(password, 10);

  if (user) {
    user.role = 'admin';
    user.passwordHash = passwordHash; // reset password too, since this is an intentional admin provisioning step
    await user.save();
    console.log(`Existing user "${user.username}" promoted to admin.`);
  } else {
    user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`Admin user "${user.username}" created.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('[seedAdmin] Failed:', err);
  process.exit(1);
});
