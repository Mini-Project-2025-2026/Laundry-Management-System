// The backend doesn't model which specific services each business offers
// (only the shared, global price list) — these are assigned deterministically
// by business id purely for card display, matching the reference UI's tag
// chips. Swap for real per-business service data whenever that's modeled.
const TAG_POOL = [
  'Wash & Fold', 'Dry Cleaning', 'Wash & Iron', 'Carpet Washing',
  'Premium Laundry', 'Steam Press', 'Curtain Cleaning', 'Shoe Cleaning',
];

export function getBusinessTags(businessId) {
  const a = TAG_POOL[businessId % TAG_POOL.length];
  const b = TAG_POOL[(businessId + 3) % TAG_POOL.length];
  return a === b ? [a] : [a, b];
}

// Deterministic "starting price" per business — the real price list is
// shared/global (see the counter-tool price_list table), not per-business,
// so this is a display-only stand-in until per-business pricing exists.
export function getStartingPrice(businessId) {
  return 15 + (businessId % 20) * 2;
}
