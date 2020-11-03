import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const date = new Date();
    const data = JSON.parse(event.body);
    const createParams = {
        TableName: process.env.tableName,
        RangeKeyValue: {S:  data.rangeKey},
        GeoPoint: {
            latitude: data.coordinates[0],
            longitude: data.coordinates[1]
        },
        UpdateItemInput: {
            UpdateExpression: 'SET content = :newContent , updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':newContent': {S: JSON.stringify(data.content) },
                ':updatedAt': {S: date.toISOString()},
            }
        }
    };

    try {
        const update = await dynamoDbLib.callGeo("updatePoint", createParams, true);

        if (update) {
            console.log(update);
            return success(update);
        } else {
            return failure({status: false, error: "There was a problem with updating you information."});
        }
    } catch (e) {
        console.log(e);
        return failure({status: false});
    }
}
