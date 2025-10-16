#!/usr/bin/env node

/**
 * Convert a Mounjaro Tracker export (array of daily/medication entries)
 * into a BodyMetrics-compatible import payload containing measurements
 * and optional medicationEvents.
 *
 * Usage:
 *   node scripts/migrate-mounjaro-to-bodymetrics.js <input.json> [output.json]
 */

const fs = require('fs');
const path = require('path');

const [, , inputArg, outputArg] = process.argv;

if (!inputArg) {
  console.error('Usage: node scripts/migrate-mounjaro-to-bodymetrics.js <input.json> [output.json]');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(
  process.cwd(),
  outputArg || 'bodymetrics-import-from-mounjaro.json'
);

let raw;
try {
  raw = fs.readFileSync(inputPath, 'utf8');
} catch (error) {
  console.error(`❌ Unable to read input file: ${inputPath}`);
  console.error(error.message);
  process.exit(1);
}

let entries;
try {
  entries = JSON.parse(raw);
  if (!Array.isArray(entries)) {
    throw new Error('Expected top-level JSON array.');
  }
} catch (error) {
  console.error('❌ Invalid JSON format. Ensure the export file is a JSON array.');
  console.error(error.message);
  process.exit(1);
}

const measurementMap = new Map();
const medicationMap = new Map();

const skipped = {
  daily: 0,
  medication: 0,
  malformed: 0,
};

const isValidDate = (value) => {
  if (!value) return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

const normalizeWeight = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const normalized = parseFloat(String(value).replace(',', '.'));
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }
  return parseFloat(normalized.toFixed(2));
};

entries.forEach((entry) => {
  if (!entry || typeof entry !== 'object') {
    skipped.malformed += 1;
    return;
  }

  const { type } = entry;

  if (type === 'daily') {
    const date = entry.date;
    const weight = normalizeWeight(entry.weight);
    const notes = entry.notes || null;

    if (!isValidDate(date) || !weight) {
      skipped.daily += 1;
      return;
    }

    const key = entry.id ? String(entry.id) : `${date}-daily`;
    if (!measurementMap.has(key)) {
      measurementMap.set(key, {
        date,
        weight,
        bodyFatPercent: null,
        waterPercent: null,
        musclePercent: null,
        boneMass: null,
        notes,
      });
      return;
    }

    // Merge notes if both entries share the same identifier.
    const existing = measurementMap.get(key);
    if (!existing.notes && notes) {
      existing.notes = notes;
    }
    return;
  }

  if (type === 'medication') {
    const date = entry.date;
    const dose = entry.dose ? String(entry.dose).trim() : '';
    const notesParts = [];

    if (!isValidDate(date) || !dose) {
      skipped.medication += 1;
      return;
    }

    if (entry.notes) {
      notesParts.push(String(entry.notes).trim());
    }

    const weight = normalizeWeight(entry.weight);
    if (weight) {
      notesParts.push(`Weight at dose: ${weight}`);
    }

    const notes = notesParts.length ? notesParts.join(' | ') : null;
    const key = entry.id ? String(entry.id) : `${date}-medication`;

    if (!medicationMap.has(key)) {
      medicationMap.set(key, {
        date,
        dose,
        notes,
      });
      return;
    }

    const existing = medicationMap.get(key);
    if (notes) {
      const existingNotes = existing.notes ? `${existing.notes} | ${notes}` : notes;
      existing.notes = existingNotes;
    }
    return;
  }

  // Any unfamiliar entry types are skipped.
  skipped.malformed += 1;
});

const measurements = Array.from(measurementMap.values()).sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date)
);

const medicationEvents = Array.from(medicationMap.values()).sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date)
);

const outputPayload = {
  measurements,
  medicationEvents,
  exportDate: new Date().toISOString(),
  version: '1.2',
};

try {
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2), 'utf8');
  console.log('✅ Migration complete.');
  console.log(`   Measurements written: ${measurements.length}`);
  console.log(`   Medication events written: ${medicationEvents.length}`);
  if (skipped.daily || skipped.medication || skipped.malformed) {
    console.log(
      `   Skipped entries — daily: ${skipped.daily}, medication: ${skipped.medication}, other: ${skipped.malformed}`
    );
  }
  console.log(`   Output file: ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to write output file.');
  console.error(error.message);
  process.exit(1);
}
