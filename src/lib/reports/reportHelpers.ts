export function formatDate(value: any) {
  if (!value) return "-";

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);

  return date.toLocaleDateString("hr-HR");
}

export function getWeightChange(
  measurements: any[]
) {
  if (measurements.length < 2) {
    return 0;
  }

  const first = Number(measurements[0].weight);
  const last = Number(
    measurements[measurements.length - 1].weight
  );

  return last - first;
}

export function filterByDays(
  items: any[],
  days: number | null
) {
  if (days === null) {
    return items;
  }

  const now = Date.now();

  return items.filter((item) => {
    const date =
      item.createdAt?.toDate
        ? item.createdAt.toDate()
        : new Date(item.createdAt);

    const diff =
      (now - date.getTime()) /
      (1000 * 60 * 60 * 24);

    return diff <= days;
  });
}