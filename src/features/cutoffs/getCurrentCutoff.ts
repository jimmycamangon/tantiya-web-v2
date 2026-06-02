export function getCurrentCutoff(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const day = date.getDate();

  if (day <= 15) {
    return {
      id: `${year}-${month + 1}-1`,
      startDate: new Date(year, month, 1),
      endDate: new Date(year, month, 15),
    };
  }

  return {
    id: `${year}-${month + 1}-2`,
    startDate: new Date(year, month, 16),
    endDate: new Date(year, month + 1, 0),
  };
}