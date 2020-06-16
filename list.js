import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";


function filterArray(array, filters) {
    const filterKeys = Object.keys(filters);
    return array.filter(item => {
        // validates all filter criteria
        return filterKeys.every(key => {
            // ignores non-function predicates
            if (typeof filters[key] !== 'function') return true;
            return filters[key](item[key]);
        });
    });
}

export async function main(event, context) {
    const {queryStringParameters} = event;
    const params = {
        TableName: process.env.tableName,
        RadiusInMeter: queryStringParameters.radius || 1000,
        CenterPoint: {
            latitude: parseFloat(queryStringParameters.lat),
            longitude: parseFloat(queryStringParameters.lng)
        }
    };

    try {
        const result = await dynamoDbLib.callGeo("queryRadius", params);
        const filters  = {
            content: content => {
                const parsed = JSON.parse(content.S);

                const hasCar              = queryStringParameters.hasCar ? parsed.hasCar === queryStringParameters.hasCar : true;
                const lightHousekeeping   = queryStringParameters.lightHousekeeping ? parsed.lightHousekeeping === queryStringParameters.lightHousekeeping : true;
                const comfortableWithPets = queryStringParameters.comfortableWithPets ? parsed.comfortableWithPets === queryStringParameters.comfortableWithPets : true;
                const mealPrep            = queryStringParameters.mealPrep ? parsed.mealPrep === queryStringParameters.mealPrep : true;
                const helpWithHomework    = queryStringParameters.helpWithHomework ? parsed.helpWithHomework === queryStringParameters.helpWithHomework : true;
                const travelDistance      = queryStringParameters.travelDistance ? parseInt(parsed.travelDistance, 10) > queryStringParameters.travelDistance : true;
                const maxChildren         = queryStringParameters.maxChildren ? parseInt(parsed.maxChildren,10) > queryStringParameters.maxChildren : true;
                const experienceYears     = queryStringParameters.experienceYears ? parseInt(parsed.experienceYears,10) >= queryStringParameters.experienceYears : true;

                return hasCar && lightHousekeeping && comfortableWithPets && mealPrep && helpWithHomework && travelDistance && maxChildren && experienceYears;
            },
        };

        const items = filterArray(result, filters);

        return success(items);
    } catch (e) {
        return failure({ status: false });
    }
}
