/**
 *
 * @param {number} statusCode
 * @param {object} data
 * @param {object | undefined} overrides
 *
 */
module.exports.createResponse = (statusCode, data, overrides) => {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      ...overrides?.headers,
    },
  };
};

/**
 *
 * @param {number} statusCode
 * @param {object} errorData
 * @param {object | undefined} overrides
 *
 */
module.exports.createErrorResponse = (statusCode, errorData, overrides) => {
  return {
    statusCode: statusCode || 500,
    body: JSON.stringify({
      message: errorData.message || 'Something went wrong',
      code: errorData.code,
      requestId: errorData.requestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      ...overrides?.headers,
    },
  };
};
