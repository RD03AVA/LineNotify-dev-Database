import { queryItems } from '../database/DynamoDB';
import { createExpression } from '../util/ExpressionCreater';

export const queryData = async (
  tableName: string,
  requestBody: any,
): Promise<Record<string, any>> => {
  const limit = requestBody.limit ? parseInt(requestBody.limit, 10) : 20;
  const offset = requestBody.offset ? parseInt(requestBody.offset, 10) : 0;
  const sort = requestBody.sort === 'asc';
  const consistent = requestBody.consistent || false;
  const indexName = requestBody.indexName || null;

  const { keyConditionExp, filterConditionExp, expNames, expValues } =
    createExpression(requestBody);

  const options = {
    indexName: indexName,
    filterConditionExp: filterConditionExp,
    limit: limit,
    ConsistentRead: consistent,
    ScanIndexForward: sort,
  };

  try {
    const data = await queryItems(
      tableName,
      keyConditionExp,
      expNames,
      expValues,
      options,
    );

    if (!data || !data.Items || data.Items.length === 0) {
      return {};
    }

    const items = offset ? data.Items.slice(offset) : data.Items;
    return items;
  } catch (error) {
    console.error('queryData:', error);
    throw new Error('Error while querying data');
  }
};
