import { BatchOperationDB } from '../database/DynamoDB';
import { validateRequestFormat } from '../util/DataValidator';

export const putBatchData = async (putRequest: {
  [tableName: string]: Record<string, unknown>[];
}): Promise<string> => {
  try {
    validateRequestFormat(putRequest);

    const batchOperationDB = new BatchOperationDB();

    await batchOperationDB.putBatchItems(putRequest);

    return 'Data added successfully';
  } catch (error) {
    console.error('putBatchData:', error);
    throw new Error('Error while adding data');
  }
};
