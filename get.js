import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params = {
        TableName: process.env.tableName,
        Key: {
            babysitterId: event.pathParameters.id
        }
    };

    try {
        const result = await dynamoDbLib.call("scan", params, true);
        if (result.Count > 0) {
            return success(result.Items[0]);
        } else {
            return failure({ status: false, error: "Babysitter not found." });
        }
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
