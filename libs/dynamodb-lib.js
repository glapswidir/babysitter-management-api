import AWS from "aws-sdk";

export function call(action, params) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    return dynamoDb[action](params).promise();
}

export function callGeo(action, params, isPromised = false) {
    const ddbGeo            = require('dynamodb-geo');
    const {TableName}       = params;
    const ddb               = new AWS.DynamoDB();
    const config            = new ddbGeo.GeoDataManagerConfiguration(ddb, TableName);
    config.hashKeyLength    = 5;
    const myGeoTableManager = new ddbGeo.GeoDataManager(config);

    if (isPromised) {
        return myGeoTableManager[action](params).promise();
    }
    return myGeoTableManager[action](params);
}
