/**
 * Format a byte size for course cards (Ko / Mo).
 * Shows 0 Ko when empty.
 */
export function formatCourseSize(bytes) {
  const n = Number(bytes) || 0;
  if (n <= 0) {
    return '0 Ko';
  }
  if (n < 1024) {
    return `${n} o`;
  }
  if (n < 1024 * 1024) {
    return `${Math.round(n / 1024)} Ko`;
  }
  const mo = n / (1024 * 1024);
  if (mo < 10) {
    return `${mo.toFixed(1).replace(/\.0$/, '')} Mo`;
  }
  return `${Math.round(mo)} Mo`;
}

/**
 * Sum size_bytes per training id from a resources list.
 */
export function sizesByTraining(resources) {
  const map = {};
  (resources || []).forEach(resource => {
    const tid = resource.training || resource.training_id;
    if (!tid) {
      return;
    }
    map[tid] = (map[tid] || 0) + (Number(resource.size_bytes) || 0);
  });
  return map;
}
