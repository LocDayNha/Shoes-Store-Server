const defaultPageSize = 20;
function getMetaData(offset, pageSize, total) {
  let nextOffset = offset + pageSize;
  let hasMore = true;
  if (nextOffset >= total) {
    nextOffset = total;
    hasMore = false;
  }
  return {
    pageSize: pageSize,
    offset: nextOffset,
    total: total,
    hasMore: hasMore,
  };
}

function validateAndGetValues(offset, pageSize) {
  if (!pageSize || !offset || Number.isNaN(pageSize) || Number.isNaN(offset)) {
    pageSize = defaultPageSize;
    offset = 0;
  }
  return {
    pageSize: Number(pageSize),
    offset: Number(offset),
  };
}
module.exports = {
  defaultPageSize,
  getMetaData,
  validateAndGetValues,
};
