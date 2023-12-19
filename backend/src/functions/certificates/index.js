const DynamoDB = require('aws-sdk/clients/dynamodb');

const { createResponse, createErrorResponse } = require('../../utils/inedx');

const documentClient = new DynamoDB.DocumentClient({
  region: 'ap-southeast-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});

const CERTIFICATE_TABLE_NAME = process.env.DB_CERTIFICATE_TABLE;

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 */
module.exports.createCertificate = async (event, context) => {
  const data = JSON.parse(event.body);

  const certificateDocument = {
    TableName: CERTIFICATE_TABLE_NAME,
    Item: {
      user_email: data.email,
      user_name: data.name,
      certificate_id: data.certificateId,
      certificate_name: data.certificateName,
      certificate_provider: data.certificateProvider,
      certificate_issue_date: data.certificateIssueDate,
      certificate_expiry_date: data.certificateExpiryDate,
      certificate_deleted: data.certificateDeleted,
    },
    ConditionExpression: 'attribute_not_exists(certificate_id)',
  };

  try {
    await documentClient.put(certificateDocument).promise();

    return createResponse(201, data);
  } catch (err) {
    console.log(err);
    err.message = err.message || 'Failed to create certificate';
    return createErrorResponse(err.statusCode, err);
  }
};
