const OrderModel = require('../order/OrderModel');
const moment = require('moment');
const dateUtil = require('../../utils/dateUtil');
const { OrderStatusEnum } = require('../order/OrderStatusEnum');
const defaultDateFormat = 'YYYY-MM-DD';
let dateFormat = defaultDateFormat;
const getTotalOrderStatistics = async (
  filterDateType,
  orderStatus,
  fromDate,
  toDate,
  dateLabelFormat
) => {
  try {
    if (!fromDate || !toDate || !orderStatus || !filterDateType) {
      throw Error('Missing orderStatus or fromDate or toDate or dateType params');
    }

    dateFormat = dateLabelFormat ? dateLabelFormat : defaultDateFormat;
    filterDateType = filterDateType.toUpperCase();
    orderStatus = orderStatus.toUpperCase();
    switch (filterDateType) {
      case 'YEAR':
        return await getTotalOrderStatisticsByYear(filterDateType, orderStatus, fromDate, toDate);
      case 'MONTH':
        return await getTotalOrderStatisticsByMonth(filterDateType, orderStatus, fromDate, toDate);
      case 'WEEK':
        return await getTotalOrderStatisticsByWeek(filterDateType, orderStatus, fromDate, toDate);
      case 'DAY':
        return await getTotalOrderStatisticsByDayOfWeek(
          filterDateType,
          orderStatus,
          fromDate,
          toDate
        );
      default:
        return `Error get statistic for total order with dateType: ${filterDateType}`;
    }
  } catch (error) {
    console.log('Cannot getTotalOrderStatistics: ' + error.message);
    throw error;
  }
};
const createAggregateForTotalOrders = (filterDateType, orderStatus, fromDate, toDate) => {
  try {
    let aggregate = [
      {
        $match: {
          $and: [
            {
              status: orderStatus === 'ALL' ? { $regex: /./ } : orderStatus,
            },
            {
              createdAt: {
                $gte: moment(fromDate).startOf('date').toDate(),
              },
            },
            {
              createdAt: {
                $lte: moment(toDate).endOf('date').toDate(),
              },
            },
          ],
        },
      },
    ];
    switch (filterDateType) {
      case 'YEAR': {
        aggregate.push(
          {
            $group: {
              _id: {
                $year: '$createdAt',
              },
              total: {
                $count: {},
              },
            },
          },
          {
            $set: {
              year: '$_id',
            },
          }
        );
        break;
      }
      case 'MONTH': {
        aggregate.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              total: {
                $count: {},
              },
            },
          },
          {
            $set: {
              year: '$_id.year',
              month: '$_id.month',
            },
          }
        );
        break;
      }
      case 'WEEK': {
        aggregate.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' },
              },
              total: {
                $count: {},
              },
            },
          },
          {
            $set: {
              year: '$_id.year',
              week: '$_id.week',
            },
          }
        );
        break;
      }
      case 'DAY': {
        aggregate.push(
          {
            $group: {
              _id: {
                dayOfWeek: { $dayOfWeek: '$createdAt' },
              },
              total: {
                $count: {},
              },
            },
          },
          {
            $set: {
              dayOfWeek: '$_id.dayOfWeek',
            },
          }
        );
        break;
      }
      default:
        break;
    }
    return aggregate;
  } catch (error) {
    throw error;
  }
};

const getTotalOrderStatisticsByYear = async (filterDateType, orderStatus, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrders(filterDateType, orderStatus, fromDate, toDate)
    );
    const dates = dateUtil.getYearsBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [obj._id, obj.total];
      })
    );
    for (date of dates) {
      let count = queryResultMap.get(date.getFullYear());
      if (!count) {
        count = 0;
      }
      result.push({ date: moment(date).endOf('year').format(dateFormat), total: count });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getTotalOrderStatisticsByMonth = async (filterDateType, orderStatus, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrders(filterDateType, orderStatus, fromDate, toDate)
    );
    const dates = dateUtil.getMonthsBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [`${obj.year}-${obj.month}`, obj.total];
      })
    );
    for (date of dates) {
      let yearOfDate = date.getFullYear();
      let monthOfDate = date.getMonth() + 1;
      let count = queryResultMap.get(`${yearOfDate}-${monthOfDate}`);
      if (!count) {
        count = 0;
      }
      result.push({ date: moment(date).endOf('month').format(dateFormat), total: count });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getTotalOrderStatisticsByWeek = async (filterDateType, orderStatus, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrders(filterDateType, orderStatus, fromDate, toDate)
    );
    const dates = dateUtil.getWeeksBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [`${obj.year}-${obj.week}`, obj.total];
      })
    );
    for (date of dates) {
      let yearOfDate = date.startWeekDate.getFullYear();
      let startWeekDate = moment(date.startWeekDate).format(dateFormat);
      let endWeekDate = moment(date.endWeekDate).format(dateFormat);
      let weekNumber = date.weekNumber;
      let count = queryResultMap.get(`${yearOfDate}-${weekNumber}`);
      if (!count) {
        count = 0;
      }
      result.push({
        year: yearOfDate,
        startWeekDate: startWeekDate,
        endWeekDate: endWeekDate,
        weekNumber: weekNumber,
        total: count,
        date: `${startWeekDate} - ${endWeekDate}`,
      });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getTotalOrderStatisticsByDayOfWeek = async (
  filterDateType,
  orderStatus,
  fromDate,
  toDate
) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrders(filterDateType, orderStatus, fromDate, toDate)
    );

    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [obj.dayOfWeek, obj.total];
      })
    );
    let dayOfWeek = 1;
    while (dayOfWeek <= 7) {
      let total = queryResultMap.get(dayOfWeek);
      if (!total) {
        total = 0;
      }
      result.push({
        dayOfWeek: dayOfWeek,
        date: capitalize(
          moment()
            .locale('vi')
            .weekday(dayOfWeek - 1)
            .format('dddd')
        ),
        total: total,
      });
      dayOfWeek++;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

const capitalize = (s) => {
  return s[0].toUpperCase() + s.slice(1);
};

const createAggregateForTotalOrdersRevenue = (filterDateType, fromDate, toDate) => {
  try {
    let aggregate = [
      {
        $match: {
          $and: [
            {
              status: OrderStatusEnum.COMPLETED,
            },
            {
              createdAt: {
                $gte: moment(fromDate).startOf('date').toDate(),
              },
            },
            {
              createdAt: {
                $lte: moment(toDate).endOf('date').toDate(),
              },
            },
          ],
        },
      },
    ];
    switch (filterDateType) {
      case 'YEAR': {
        aggregate.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
              },
              revenue: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $set: {
              year: '$_id.year',
            },
          }
        );
        break;
      }
      case 'MONTH': {
        aggregate.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              revenue: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $set: {
              year: '$_id.year',
              month: '$_id.month',
            },
          }
        );
        break;
      }
      case 'WEEK': {
        aggregate.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' },
              },
              revenue: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $set: {
              year: '$_id.year',
              week: '$_id.week',
            },
          }
        );
        break;
      }
      case 'DAY': {
        aggregate.push(
          {
            $group: {
              _id: {
                dayOfWeek: { $dayOfWeek: '$createdAt' },
              },
              revenue: {
                $sum: '$totalAmount',
              },
            },
          },
          {
            $set: {
              dayOfWeek: '$_id.dayOfWeek',
            },
          }
        );
        break;
      }
      default:
        break;
    }
    return aggregate;
  } catch (error) {
    throw error;
  }
};

const getRevenueOrderStatisticsByYear = async (filterDateType, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrdersRevenue(filterDateType, fromDate, toDate)
    );
    const dates = dateUtil.getYearsBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [obj.year, obj.revenue];
      })
    );

    for (date of dates) {
      let revenue = queryResultMap.get(date.getFullYear());
      if (!revenue) {
        revenue = 0;
      }
      result.push({
        date: date.getFullYear(),
        revenue: revenue,
      });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getRevenueOrderStatisticsByMonth = async (filterDateType, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrdersRevenue(filterDateType, fromDate, toDate)
    );
    const dates = dateUtil.getMonthsBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [`${obj.year}-${obj.month}`, obj.revenue];
      })
    );
    console.log(queryResult);
    for (date of dates) {
      let yearOfDate = date.getFullYear();
      let monthOfDate = date.getMonth() + 1;
      let revenue = queryResultMap.get(`${yearOfDate}-${monthOfDate}`);
      if (!revenue) {
        revenue = 0;
      }
      result.push({ date: moment(date).endOf('month').format(dateFormat), revenue: revenue });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getRevenueOrderStatisticsByWeek = async (filterDateType, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrdersRevenue(filterDateType, fromDate, toDate)
    );
    const dates = dateUtil.getWeeksBetweenDateRange(fromDate, toDate);
    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [`${obj.year}-${obj.week}`, obj.revenue];
      })
    );
    for (date of dates) {
      let yearOfDate = date.startWeekDate.getFullYear();
      let startWeekDate = moment(date.startWeekDate).format(dateFormat);
      let endWeekDate = moment(date.endWeekDate).format(dateFormat);
      let weekNumber = date.weekNumber;
      let revenue = queryResultMap.get(`${yearOfDate}-${weekNumber}`);
      if (!revenue) {
        revenue = 0;
      }
      result.push({
        year: yearOfDate,
        startWeekDate: startWeekDate,
        endWeekDate: endWeekDate,
        weekNumber: weekNumber,
        revenue: revenue,
        date: `${startWeekDate} - ${endWeekDate}`,
      });
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const getRevenueStatisticsByDayOfWeek = async (filterDateType, fromDate, toDate) => {
  try {
    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalOrdersRevenue(filterDateType, fromDate, toDate)
    );

    let result = [];
    const queryResultMap = new Map(
      queryResult.map((obj) => {
        return [obj.dayOfWeek, obj.revenue];
      })
    );
    let dayOfWeek = 1;
    while (dayOfWeek <= 7) {
      let revenue = queryResultMap.get(dayOfWeek);
      if (!revenue) {
        revenue = 0;
      }
      result.push({
        dayOfWeek: dayOfWeek,
        date: capitalize(
          moment()
            .locale('vi')
            .weekday(dayOfWeek - 1)
            .format('dddd')
        ),
        revenue: revenue,
      });
      dayOfWeek++;
    }

    return result;
  } catch (error) {
    throw error;
  }
};

const getTotalRevenueOrderStatistics = async (
  filterDateType,
  fromDate,
  toDate,
  dateLabelFormat
) => {
  try {
    if (!fromDate || !toDate || !filterDateType) {
      throw Error('Missing fromDate or toDate or dateType params');
    }

    dateFormat = dateLabelFormat ? dateLabelFormat : defaultDateFormat;
    filterDateType = filterDateType.toUpperCase();

    switch (filterDateType) {
      case 'YEAR':
        return await getRevenueOrderStatisticsByYear(filterDateType, fromDate, toDate);
      case 'MONTH':
        return await getRevenueOrderStatisticsByMonth(filterDateType, fromDate, toDate);
      case 'WEEK':
        return await getRevenueOrderStatisticsByWeek(filterDateType, fromDate, toDate);
      case 'DAY':
        return await getRevenueStatisticsByDayOfWeek(filterDateType, fromDate, toDate);
      default:
        return `Error get total revenue for order with dateType: ${filterDateType}`;
    }
  } catch (error) {
    console.log('Cannot getTotalRevenueOrderStatistics: ' + error.message);
    throw error;
  }
};

const createAggregateForTotalSellingProduct = (fromDate, toDate, orderStatus) => {
  try {
    let aggregate = [
      {
        $match: {
          $and: [
            {
              status: orderStatus === 'ALL' ? { $regex: /./ } : orderStatus,
            },
            {
              createdAt: {
                $gte: moment(fromDate).startOf('date').toDate(),
              },
            },
            {
              createdAt: {
                $lte: moment(toDate).endOf('date').toDate(),
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$detail',
        },
      },
      {
        $group: {
          _id: {
            product: '$detail.productId',
          },
          total: {
            $sum: '$detail.quantity',
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $set: {
          productName: {
            $first: '$product.title',
          },
        },
      },
      {
        $project: {
          product: 0,
          _id: 0,
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ];
    return aggregate;
  } catch (error) {
    throw error;
  }
};

const getTotalSellingProductStatistics = async (fromDate, toDate, orderStatus) => {
  try {
    if (!fromDate || !toDate || !orderStatus) {
      throw Error('Missing fromDate or toDate or orderStatus params');
    }

    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalSellingProduct(fromDate, toDate, orderStatus)
    );

    return queryResult;
  } catch (error) {
    console.log('Cannot getTotalSellingProductStatistics: ' + error.message);
    throw error;
  }
};

const createAggregateForTotalSellingProductByBrand = (fromDate, toDate, orderStatus) => {
  try {
    let aggregate = [
      {
        $match: {
          $and: [
            {
              status: orderStatus === 'ALL' ? { $regex: /./ } : orderStatus,
            },
            {
              createdAt: {
                $gte: moment(fromDate).startOf('date').toDate(),
              },
            },
            {
              createdAt: {
                $lte: moment(toDate).endOf('date').toDate(),
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$detail',
        },
      },

      {
        $lookup: {
          from: 'products',
          localField: 'detail.productId',
          foreignField: '_id',
          as: 'product',
        },
      },

      {
        $set: {
          brandId: {
            $first: '$product.brand',
          },
        },
      },
      {
        $group: {
          _id: {
            brandId: '$brandId',
          },
          total: {
            $sum: '$detail.quantity',
          },
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: '_id.brandId',
          foreignField: '_id',
          as: 'brand',
        },
      },
      {
        $set: {
          brandName: {
            $first: '$brand.name',
          },
        },
      },
      {
        $project: {
          _id: 0,
          brand: 0,
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ];
    return aggregate;
  } catch (error) {
    throw error;
  }
};

const getTotalSellingProductByBrandStatistics = async (fromDate, toDate, orderStatus) => {
  try {
    if (!fromDate || !toDate || !orderStatus) {
      throw Error('Missing fromDate or toDate or orderStatus params');
    }

    const queryResult = await OrderModel.aggregate(
      createAggregateForTotalSellingProductByBrand(fromDate, toDate, orderStatus)
    );
    console.log(queryResult);
    return queryResult;
  } catch (error) {
    console.log('Cannot getTotalSellingProductByBrandStatistics: ' + error.message);
    throw error;
  }
};

module.exports = {
  getTotalOrderStatistics,
  getTotalRevenueOrderStatistics,
  getTotalSellingProductStatistics,
  getTotalSellingProductByBrandStatistics,
};
