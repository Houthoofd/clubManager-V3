'use strict';

const path = require('path');

// Load main .env for DB credentials and JWT secrets (DB_HOST, DB_USER, etc.)
// dotenv does NOT override already-set env vars, so our override below is safe
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Override database name — MUST come after dotenv.config()
process.env.DB_NAME  = 'clubmanager_test';
process.env.NODE_ENV = 'test';
