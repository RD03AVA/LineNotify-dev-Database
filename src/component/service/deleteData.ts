import { deleteItem } from '../database/DynamoDB';

const _getKey = (tableName: string, partitionKey: string) => {
  switch (tableName) {
    case 'Dev_LineNotify_UserInfo':
      return { student_id: partitionKey };
    case 'Dev_LineNotify_ParentInfo':
      return { parent_id: partitionKey };
    default:
      throw new Error('Invalid table name');
  }
};

export const deleteData = async (
  tableName: string,
  partitionKey: string,
): Promise<string> => {
  try {
    const key = _getKey(tableName, partitionKey);
    const data = await deleteItem(tableName, key);

    if (data.Attributes === undefined) {
      return 'No data found';
    }

    return `data with ${partitionKey} deleted successfully`;
  } catch (error) {
    console.error('deleteData:', error);
    throw new Error('Error while deleting data');
  }
};
