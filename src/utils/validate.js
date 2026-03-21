
export function requireFields(body, fields) {
  const missing = fields.filter(f => !body?.[f]);
  if (missing.length) {
    const err = new Error("Missing required fields");
    err.code = 400; err.missing = missing;
    throw err;
  }
}

export function parseDateTime(s) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    const err = new Error("Invalid datetime");
    err.code = 400;
    throw err;
  }
  return d;
}
