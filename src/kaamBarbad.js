"use strict";
const AWS = require("aws-sdk");

const kaamBarbad = async (event) => {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const { id } = event.pathParameters;

  await dynamoDb.delete({
    TableName: "KaamKaro",
    Key: {
      id: id
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "success",
      message: `Kaam with ID ${id} has been completely barbad (deleted)!`
    }),
  };
};


module.exports = {
  handler: kaamBarbad
};