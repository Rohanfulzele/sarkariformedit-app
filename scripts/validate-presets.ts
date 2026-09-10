import { getAllPresets, isPresetStale, STALE_AFTER_DAYS } from "../presets";

function main() {
  const presets = getAllPresets();
  console.log(`Loaded ${presets.length} preset(s), schema OK.\n`);

  const stale = presets.filter((p) => isPresetStale(p));
  if (stale.length > 0) {
    console.warn(
      `WARNING: ${stale.length} preset(s) are older than ${STALE_AFTER_DAYS} days since last verification:`
    );
    for (const p of stale) {
      console.warn(`  - ${p.id} (last verified ${p.lastVerifiedDate})`);
    }
    console.warn(
      "\nThese will show a staleness banner in the UI. Re-verify against the current official notification and bump lastVerifiedDate."
    );
  } else {
    console.log("No stale presets.");
  }
}

main();
