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

function available(start, stop, availability) {
    const startDateTime = start.split(/T|\:/);
    const stopDateTime  = stop.split(/T|\:/);

    if (availability === undefined) {
        return false;
    }

    const isAvailable = availability.filter(item => {
        if (item.date === startDateTime[0]) {
            return item.options._allDay || item.options._day || parseInt(startDateTime[1]) <= parseInt(item.options._selectedStart);
        }
        if (item.date === stopDateTime[0]) {
            return item.options._allDay || item.options._day || parseInt(stopDateTime[1]) <= parseInt(item.options._selectedEnd);
        }
    });

    return isAvailable.length === 2;
}

export async function main(event, context) {
    const {queryStringParameters} = event;
    const params = {
        TableName: process.env.tableName,
        RadiusInMeter: queryStringParameters.radius || 1000,
        CenterPoint: {
            latitude: parseFloat(queryStringParameters.lat),
            longitude: parseFloat(queryStringParameters.lng)
        },
        FilterExpression: "#type = :type",
        ExpressionAttributeNames:{
            "#type": "type"
        },
        ExpressionAttributeValues: {
            ":type": "Babysitter"
        }
    };

    try {
        const result = await dynamoDbLib.callGeo("queryRadius", params);
        const filters  = {
            content: content => {
                const parsed = JSON.parse(content.S);
                const {hasCar, lightHousekeeping , comfortableWithPets, mealPrep, helpWithHomework, travelDistance, maxChildren, experienceYears, dateStart, dateStop} = queryStringParameters;

                const car          = hasCar ? parsed.hasCar === hasCar : true;
                const houseKeeping = lightHousekeeping ? parsed.lightHousekeeping === lightHousekeeping : true;
                const pets         = comfortableWithPets ? parsed.comfortableWithPets === comfortableWithPets : true;
                const meals        = mealPrep ? parsed.mealPrep === mealPrep : true;
                const homework     = helpWithHomework ? parsed.helpWithHomework === helpWithHomework : true;
                const travel       = travelDistance ? parseInt(parsed.travelDistance, 10) > travelDistance : true;
                const max          = maxChildren ? parseInt(parsed.maxChildren,10) > maxChildren : true;
                const experience   = experienceYears ? parseInt(parsed.experienceYears,10) >= experienceYears : true;
                const isAvailable  = (dateStart && dateStop && parsed.available !== null) ? available(dateStart, dateStop, parsed.available) : true;

                return car && houseKeeping && pets && meals && homework && travel && max && experience && isAvailable;
            }
        };

        const items = filterArray(result, filters);

        return success(items);
    } catch (e) {
        console.log(e);
        return failure({ status: false });
    }
}
