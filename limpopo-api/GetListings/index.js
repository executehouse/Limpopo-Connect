const db = require('../db');

module.exports = async function (context, req) {
  try {
    const res = await db.query('SELECT 1 as ok');
    context.res = { status: 200, body: { success: true, rows: res.rows } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { success: false, error: err.message } };
  }
};
