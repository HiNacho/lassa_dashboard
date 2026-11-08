const aliases = new Map([
  ['abuja', 'FCT'],
  ['fct abuja', 'FCT'],
  ['federal capital territory', 'FCT'],
  ['akwa-ibom', 'Akwa Ibom'],
  ['cross-river', 'Cross River'],
]);

export function normalizeStateName(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return aliases.get(trimmed.toLowerCase()) || trimmed;
}

export function matchStates(observations, geoStateNames) {
  const known = new Set(geoStateNames.map(normalizeStateName));
  const matched = [];
  const unmatched = [];
  observations.forEach((observation) => {
    const state = normalizeStateName(observation.state_clean || observation.state);
    if (state && known.has(state)) matched.push({ ...observation, normalizedState: state });
    else unmatched.push({ ...observation, normalizedState: state });
  });
  return { matched, unmatched };
}

export function observationStatus(record, hasGeography = true) {
  if (!hasGeography) return 'unavailable_geography';
  if (!record) return 'missing';
  if (!Number.isFinite(record.confirmed) || !Number.isFinite(record.deaths)) return 'invalid';
  return 'observed';
}

export const observationStatusLabel = {
  observed: 'Observed state report',
  missing: 'No state observation available',
  invalid: 'Invalid state observation',
  unavailable_geography: 'Geographic boundary unavailable',
};
