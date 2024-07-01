import { getItem } from '../database/DynamoDB';

const _getKey = (tableName: string, partitionkey: string): Record<string, unknown> => {
  let key: Record<string, unknown>;
  switch (tableName) {
    case 'Dev_LineNotify_UserInfo':
      key = { student_id: partitionkey };
      break;
    case 'Dev_LineNotify_ParentInfo':
      key = { parent_id: partitionkey };
      break;
    default:
      throw new Error('Invalid table name');
  }
  return key;
};

export const getData = async (
  tableName: string,
  partitionkey: string,
): Promise<Record<string, unknown>> => {
  try {
    const key = _getKey(tableName, partitionkey);
    const data = await getItem(tableName, key);

    if (!data) return {};

    return JSON.parse(JSON.stringify(data.Item));
  } catch (error) {
    console.error('getData:', error);
    throw new Error('Error while getting data');
  }
};
