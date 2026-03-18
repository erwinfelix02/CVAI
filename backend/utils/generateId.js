import IdCounter from "../models/IdCounter.js";

function buildId({ prefix, year, seq }) {
  return `${prefix}-${year}-${String(seq).padStart(3, "0")}`;
}

function randomize(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
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

async function findRandomAvailableSequence({ prefix, year, checks = [] }) {
  const allNumbers = Array.from({ length: 999 }, (_, i) => i + 1);
  const shuffled = randomize(allNumbers);

  for (const seq of shuffled) {
    const candidateId = buildId({ prefix, year, seq });
    const exists = await idExistsInAnyCollection({
      checks,
      id: candidateId,
    });

    if (!exists) {
      return candidateId;
    }
  }

  return null;
}

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

    if (seq <= 999) {
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

      continue;
    }

    break;
  }

  const randomAvailableId = await findRandomAvailableSequence({
    prefix,
    year,
    checks,
  });

  if (randomAvailableId) {
    return randomAvailableId;
  }

  throw new Error(
    `All ID numbers for ${prefix}-${year} are already used. Please switch to a 4-digit format.`,
  );
}