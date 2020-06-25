import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const uuid = require('uuid');
    const date = new Date();
    const data = JSON.parse(event.body);
    const createParams = {
        TableName: process.env.tableName,
        RangeKeyValue: {S: uuid.v4()},
        GeoPoint: {
            latitude: data.coordinates[0],
            longitude: data.coordinates[1]
        },
        PutItemInput: {
            Item: {
                updatedAt: {S: date.toISOString()},
                createdAt: {S: data.createdAt},
                type: {S: data.type},
                babysitterId: { S: data.id },
                content: {S: JSON.stringify(data.content) },
            }
        }
    };

    const removeParams = {
        TableName: process.env.tableName,
        RangeKeyValue: {S: data.rangeKey},
        GeoPoint: {
            latitude: data.coordinates[0],
            longitude: data.coordinates[1]
        },
    };

    try {
        const remove = await dynamoDbLib.callGeo("deletePoint", removeParams, true);
        const create = await dynamoDbLib.callGeo("putPoint", createParams, true);

        if (!remove) {
            console.log(remove);
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
