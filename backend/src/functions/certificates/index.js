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
const DB_CERTIFICATE_TABLE_EMAIL_INDEX =
  process.env.DB_CERTIFICATE_TABLE_EMAIL_INDEX;

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

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 */
module.exports.getCertificates = async (event, context) => {
  const userEmail = event.queryStringParameters.email;
  if (!userEmail) {
    console.log('No email provided in getCertificates');
    return createErrorResponse(err.statusCode, {
      message: 'email is required',
      requestId: context.awsRequestId,
    });
  }

  const certificateQueryParam = {
    TableName: CERTIFICATE_TABLE_NAME,
    IndexName: DB_CERTIFICATE_TABLE_EMAIL_INDEX,
    KeyConditionExpression: 'user_email = :userEmail',
    ExpressionAttributeValues: {
      ':userEmail': userEmail,
    },
  };

  try {
    const certificates = await documentClient
      .query(certificateQueryParam)
      .promise();

    return createResponse(200, certificates.Items);
  } catch (err) {
    console.log(err);
    err.message = err.message || 'Failed to create certificate';
    return createErrorResponse(err.statusCode, err);
  }
};
