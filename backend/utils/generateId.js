import IdCounter from "../models/IdCounter.js";

function buildId({ prefix, year, seq }) {
  return `${prefix}-${year}-${String(seq).padStart(3, "0")}`;
}

async function idExistsInAnyCollection({ checks = [], id }) {
  for (const check of checks) {
    if (!check?.model || !check?.field) continue;

    const exists = await check.model
      .findOne({ [check.field]: id })
      .select("_id")
      .lean();

    if (exists) return true;
  }

  return false;
}

async function findAvailableSequence({
  prefix,
  year,
  checks = [],
  startSeq = 1,
}) {
  for (let seq = startSeq; seq <= 999; seq += 1) {
    const candidateId = buildId({ prefix, year, seq });
    const exists = await idExistsInAnyCollection({
      checks,
      id: candidateId,
    });

    if (!exists) return seq;
  }

  for (let seq = 1; seq < startSeq; seq += 1) {
    const candidateId = buildId({ prefix, year, seq });
    const exists = await idExistsInAnyCollection({
      checks,
      id: candidateId,
    });

    if (!exists) return seq;
  }

  return null;
}

/**
 * Preview the next available ID without reserving it
 * and without incrementing the counter.
 */
export async function peekNextId({
  prefix,
  scope = "global",
  checks = [],
  startAt = 1,
}) {
  if (!prefix) {
    throw new Error("Prefix is required.");
  }

  const year = new Date().getFullYear();
  const counterKey = `${scope}:${prefix}:${year}`;

  const counter = await IdCounter.findOne({ key: counterKey })
    .select("seq")
    .lean();

  const nextStart = Math.max((counter?.seq || 0) + 1, startAt);

  const seq = await findAvailableSequence({
    prefix,
    year,
    checks,
    startSeq: nextStart,
  });

  if (!seq) {
    throw new Error(
      `All ID numbers for ${prefix}-${year} are already used. Please switch to a 4-digit format.`,
    );
  }

  return buildId({ prefix, year, seq });
}

/**
 * Generate the final ID for actual save.
 * This increments the counter and guarantees uniqueness.
 */
export async function generateId({
  prefix,
  scope = "global",
  checks = [],
  startAt = 1,
}) {
  if (!prefix) {
    throw new Error("Prefix is required.");
  }

  const year = new Date().getFullYear();
  const counterKey = `${scope}:${prefix}:${year}`;

  for (let attempt = 0; attempt < 999; attempt += 1) {
    const counter = await IdCounter.findOneAndUpdate(
      { key: counterKey },
      {
        $inc: { seq: 1 },
        $setOnInsert: { key: counterKey },
      },
      {
        new: true,
        upsert: true,
      },
    );

    let seq = counter.seq;

    if (seq < startAt) {
      seq = startAt;
      counter.seq = startAt;
      await counter.save();
    }

    if (seq > 999) break;

    const id = buildId({
      prefix,
      year,
      seq,
    });

    const exists = await idExistsInAnyCollection({
      checks,
      id,
    });

    if (!exists) {
      return id;
    }
  }

  const seq = await findAvailableSequence({
    prefix,
    year,
    checks,
    startSeq: startAt,
  });

  if (seq) {
    return buildId({ prefix, year, seq });
  }

  throw new Error(
    `All ID numbers for ${prefix}-${year} are already used. Please switch to a 4-digit format.`,
  );
}