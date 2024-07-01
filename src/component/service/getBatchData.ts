import { BatchOperationDB } from '../database/DynamoDB';
import { validateRequestFormat } from '../util/DataValidator';

export const getBatchData = async (getRequest: {
  [tableName: string]: Record<string, unknown>[];
}): Promise<Record<string, unknown>> => {
  try {
    validateRequestFormat(getRequest);

    const batchOperationDB = new BatchOperationDB();

    const data = await batchOperationDB.getBatchItems(getRequest);

    if (!data || Object.keys(data).length === 0) {
      return {};
    }

    return data;
  } catch (error) {
    console.error('getBatchData:', error);
    throw new Error('Error while fetching data.');
  }
};
