export function filterArray(array, filters) {
  const filterKeys = Object.keys(filters);
  return array.filter((item) => {
    // validates all filter criteria
    return filterKeys.every((key) => {
      // ignores non-function predicates
      if (typeof filters[key] !== 'function') {
        return true;
      }
      return filters[key](item[key]);
    });
  });
}

export function checkAvailability(start, stop, availability) {
  const requestStartDate = start.split(/T|\:/);
  const requestStopData = stop.split(/T|\:/);
  const daysAvailable = [];
  if (availability === undefined) {
    return false;
  }

  availability.map((item) => {
    const {
      date,
      options: { _selectedStart, _selectedEnd, _allDay, _day },
    } = item;
    if (date === requestStartDate[0]) {
      const start =
        _allDay ||
        _day ||
        parseInt(requestStartDate[1]) >= parseInt(_selectedStart);
      start ? daysAvailable.push(start) : null;
    }
    if (date === requestStopData[0]) {
      const stop =
        _allDay ||
        _day ||
        parseInt(requestStopData[1]) <= parseInt(_selectedEnd);
      stop ? daysAvailable.push(stop) : null;
    }
  });

  return daysAvailable.length === 2;
}
