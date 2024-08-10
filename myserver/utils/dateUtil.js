const moment = require('moment');

const getYearsBetweenDateRange = (fromDate, toDate) => {
  let dates = [];
  if (moment(fromDate).isAfter(toDate)) {
    return dates;
  }
  fromDate = moment(truncate(fromDate)).startOf('year');
  toDate = moment(truncate(toDate)).endOf('year');
  while (fromDate.isBefore(toDate)) {
    dates.push(fromDate.toDate());
    fromDate.add(1, 'years');
  }
  return dates;
};

const getMonthsBetweenDateRange = (fromDate, toDate) => {
  let dates = [];
  if (moment(fromDate).isAfter(toDate)) {
    return dates;
  }

  fromDate = moment(truncate(fromDate)).startOf('month');
  toDate = moment(truncate(toDate)).endOf('month');

  while (fromDate.isBefore(toDate)) {
    dates.push(fromDate.toDate());
    fromDate.add(1, 'months');
  }
  return dates;
};

const getWeeksBetweenDateRange = (fromDate, toDate) => {
  let dates = [];
  if (moment(fromDate).isAfter(toDate)) {
    return dates;
  }

  fromDate = moment(truncate(fromDate)).startOf('week');
  toDate = moment(truncate(toDate)).endOf('week');

  while (fromDate.isBefore(toDate)) {
    let endWeekDate = fromDate.endOf('week').toDate();
    let startWeekDate = fromDate.startOf('week').toDate();

    dates.push({
      startWeekDate: startWeekDate,
      endWeekDate: endWeekDate,
      weekNumber: fromDate.week(),
    });

    fromDate.add(1, 'weeks');
  }

  return dates;
};

const truncate = (date) => {
  return moment(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
};

module.exports = {
  getMonthsBetweenDateRange,
  getYearsBetweenDateRange,
  getWeeksBetweenDateRange,
  truncate,
};
