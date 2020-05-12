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

    const deleteParams = {
        TableName: process.env.tableName,
        RangeKeyValue: {S: event.pathParameters.id},
        Key: {
            babysitterId: event.requestContext.identity.cognitoIdentityId,
        },
        GeoPoint: {
            latitude: data.coordinates[0],
            longitude: data.coordinates[1]
        },
    };

    try {
        const remove = await dynamoDbLib.callGeo("deletePoint", deleteParams, true);
        const create = await dynamoDbLib.callGeo("putPoint", params, true);

        if (!remove) {
            return failure({status: false, error: "There was a problem with updating you information."});
        }

        if (create) {
            console.log(create);
            return success(create);
        } else {
            return failure({status: false, error: "There was a problem with updating you information."});
        }
    } catch (e) {
        console.log(e);
        return failure({status: false});
    }
}
