import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const {queryStringParameters} = event;
    const params = {
        TableName: process.env.tableName,
        Key: {
            babysitterId: event.pathParameters.id
        },
        FilterExpression: "#babysitterId = :id and #type = :type",
        ExpressionAttributeNames:{
            "#babysitterId": "babysitterId",
            "#type": "type"
        },
        ExpressionAttributeValues: {
            ":id": event.pathParameters.id,
            ":type": queryStringParameters.type || "Babysitter"
        }
    };

    try {
        const result = await dynamoDbLib.call("scan", params, true);
        console.log(result);
        console.log(event);
        if (result.Count > 0) {
            return success(result.Items[0]);
        } else {
            return failure({ status: false, error: "Persona not found." });
        }
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
