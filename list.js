import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { checkAvailability, filterArray } from './libs/helpers';
import getOr from 'lodash/fp/getOr';

export async function main(event, context) {
  const { queryStringParameters } = event;
  const params = {
    TableName: process.env.tableName,
    RadiusInMeter: queryStringParameters.radius || 15000,
    CenterPoint: {
      latitude: parseFloat(queryStringParameters.lat),
      longitude: parseFloat(queryStringParameters.lng),
    },
  };

  try {
    const result = await dynamoDbLib.callGeo("queryRadius", params);
    const filters = {
      content: (content) => {
        const { personalInfo, available } = JSON.parse(content.S);
        const {
          ownsCar,
          drivingLicense,
          housekeeping,
          mealPrep,
          homeworkHelp,
          specialNeedsCare,
          travelDistance,
          maxChildren,
          experienceYears,
          dateStart,
          dateStop,
          comfortableWithPets,
        } = queryStringParameters;

        const hasCar =
          ownsCar == 'true' ? getOr(false, 'ownsCar', personalInfo) : true;
        const canDrive =
          drivingLicense == 'true'
            ? getOr(false, 'drivingLicense', personalInfo)
            : true;
        const canClean =
          housekeeping == 'true'
            ? getOr(false, 'housekeeping', personalInfo)
            : true;
        const canCook =
          mealPrep == 'true' ? getOr(false, 'mealPrep', personalInfo) : true;
        const doHomework =
          homeworkHelp == 'true'
            ? getOr(false, 'homeworkHelp', personalInfo)
            : true;
        const helpDisabled =
          specialNeedsCare == 'true'
            ? getOr(false, 'specialNeedsCare', personalInfo)
            : true;
        const okayWithPets =
          comfortableWithPets == 'true'
            ? getOr(false, 'comfortableWithPets', personalInfo)
            : true;

        const travel = travelDistance
          ? parseInt(personalInfo.travelDistance, 10) >
            parseInt(travelDistance, 10)
          : true;
        const max = maxChildren
          ? parseInt(personalInfo.maxChildren, 10) > parseInt(maxChildren, 10)
          : true;
        const experience = experienceYears
          ? parseInt(experienceYears, 10) <=
            parseInt(personalInfo.experienceYears, 10)
          : true;

        //Add logic for age groups and max children will depend on parent

        const isAvailable =
          dateStart !== '_EMPTY_' &&
          dateStop !== '_EMPTY_' &&
          available !== null
            ? checkAvailability(dateStart, dateStop, available)
            : true;

        return (
          hasCar &&
          canDrive &&
          canClean &&
          canCook &&
          doHomework &&
          helpDisabled &&
          okayWithPets &&
          travel &&
          max &&
          experience &&
          isAvailable
        );
      },
      type: (type) => type.S === 'Babysitter',
    };

    const items = filterArray(result, filters);

    return success(items);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
