import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const uuid = require('uuid');
    const data = JSON.parse(event.body);
    const params = {
        TableName: process.env.tableName,
        RangeKeyValue: {S: uuid.v4()},
        GeoPoint: {
            latitude: data.coordinates[0],
            longitude: data.coordinates[1]
        },
        PutItemInput: {
            Item: {
                babysitterId: { S: event.requestContext.identity.cognitoIdentityId },
                content: {S: JSON.stringify(data.content) },
            }
        }
    };

    try {
        await dynamoDbLib.callGeo("putPoint", params, true);
        return success(params.Item);
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
