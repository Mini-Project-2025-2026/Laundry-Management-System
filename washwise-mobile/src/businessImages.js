// Real laundromat photos from Pexels (free to use, no attribution required —
// https://www.pexels.com/license/). The backend doesn't model a photo per
// business, so these are assigned deterministically by business id — swap
// this out for real uploaded photos per business whenever that's modeled.
const PHOTO_IDS = [
  4700410, 4700411, 4700383, 4700417, 4700420, 4700388,
  4700400, 4700423, 4700613, 11213210, 10344208, 4700398, 4386143,
];

export function getBusinessImageUrl(businessId, width = 500) {
  const id = PHOTO_IDS[businessId % PHOTO_IDS.length];
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}
