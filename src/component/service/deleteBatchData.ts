import { BatchOperationDB } from '../database/DynamoDB';
import { validateRequestFormat } from '../util/DataValidator';

export const deleteBatchData = async (deleteRequest: {
  [tableName: string]: Record<string, unknown>[];
}): Promise<string> => {
  try {
    validateRequestFormat(deleteRequest);

    const batchOperationDB = new BatchOperationDB();

    await batchOperationDB.deleteBatchItems(deleteRequest);

    return 'Data deleted successfully';
  } catch (error) {
    console.error('deleteBatchData:', error);
    throw new Error('An error occurred while deleting data');
  }
};
