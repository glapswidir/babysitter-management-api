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
    const params = {
        TableName: process.env.tableName,
        RadiusInMeter: event.radius || 1000,
        CenterPoint: {
            latitude: event.lat,
            longitude: event.lng
        }
    };

    try {
        const result = await dynamoDbLib.callGeo("queryRadius", params);
        const filters  = {
            content: content => {
                const parsed = JSON.parse(content.S);

                const hasCar              = data.hasCar ? parsed.hasCar === event.hasCar : true;
                const lightHousekeeping   = data.lightHousekeeping ? parsed.lightHousekeeping === event.lightHousekeeping : true;
                const comfortableWithPets = data.comfortableWithPets ? parsed.comfortableWithPets === event.comfortableWithPets : true;
                const mealPrep            = data.mealPrep ? parsed.mealPrep === data.mealPrep : true;
                const helpWithHomework    = data.helpWithHomework ? parsed.helpWithHomework === event.helpWithHomework : true;
                const travelDistance      = data.travelDistance ? parseInt(parsed.travelDistance, 10) > event.travelDistance : true;
                const maxChildren         = data.maxChildren ? parseInt(parsed.maxChildren,10) > event.maxChildren : true;
                const experienceYears     = data.experienceYears ? parseInt(parsed.experienceYears,10) >= event.experienceYears : true;

                return hasCar && lightHousekeeping && comfortableWithPets && mealPrep && helpWithHomework && travelDistance && maxChildren && experienceYears;
            },
        };

        const items = filterArray(result, filters);

        return success(items);
    } catch (e) {
        return failure({ status: false });
    }
}
