import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  // commands
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  // input types
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  BatchWriteCommandInput,
  // output types
  //PutCommandOutput,
  //BatchWriteCommandOutput,
  DeleteCommandOutput,
  UpdateCommandOutput,
  QueryCommandOutput,
  GetCommandOutput,
  // document client
  DynamoDBDocumentClient,
  BatchGetCommand,
  BatchGetCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { isPlainObject, isArrayOfObjects } from '../util/DataValidator';

const ERROR = {
  INVALID: 'Invalid input parameters',
  UNKNOWN: 'Unknown error',
};

// 錯誤處理函數
function _handleError(error: unknown, operation: string): never {
  console.error(`${operation}: ${error}`);
  throw new Error(error instanceof Error ? error.message : ERROR.UNKNOWN);
}

// 參數驗證函數
function _validateInput(tableName: string, item: object): void {
  if (!tableName || !isPlainObject(item)) {
    throw new Error(ERROR.INVALID);
  }
}

// 日誌記錄函數
function _logOperation(operation: string, params: unknown): void {
  console.log(`${operation}: ${JSON.stringify(params)}`);
}

// 建立 DynamoDB 客戶端與 DynamoDB Document 客戶端
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * 新增資料
 * @param {string} tableName 資料表名稱
 * @param {T} item 新增的資料
 * @returns {Promise<void>}
 * @throws {Error} 若新增失敗，則會拋出錯誤
 */
export const putItem = async <T extends object>(
  tableName: string,
  item: T,
): Promise<void> => {
  _validateInput(tableName, item);

  const command = new PutCommand({
    TableName: tableName,
    Item: item as Record<string, unknown>,
  } as PutCommandInput);

  try {
    await docClient.send(command);
  } catch (error) {
    _handleError(error, 'putItem');
  }
};

/**
 * 取得資料
 * @param {string} tableName 資料表名稱
 * @param {Record<string, unknown>} key 取得的資料的鍵值
 * @returns {Promise<GetCommandOutput>}
 * @throws {Error} 若取得失敗，則會拋出錯誤
 */
export const getItem = async (
  tableName: string,
  key: Record<string, unknown>,
): Promise<GetCommandOutput> => {
  _validateInput(tableName, key);

  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  } as GetCommandInput);

  try {
    const data = await docClient.send(command);
    return data;
  } catch (error) {
    console.error(`getItem: ${JSON.parse(JSON.stringify(error))}`);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * 查詢資料
 * @param {string} tableName 資料表名稱
 * @param {string} [indexName] 索引名稱(GSI或LSI)
 * @param {string} keyConditionExpression 查詢條件
 * @param {Record<string, string>} expressionAttributeNames 參數化查詢屬性名稱
 * @param {Record<string, unknown>} expressionAttributeValues 參數化查詢條件
 * @param {Object} options 選項包含 limit, ConsistentRead, ScanIndexForward
 * @returns {Promise<QueryCommandOutput>} 查詢到的資料
 * @throws {Error} 若查詢失敗，則會拋出錯誤
 */
export const queryItems = async (
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeNames: Record<string, string>,
  expressionAttributeValues: Record<string, unknown>,
  options: {
    indexName?: string;
    filterConditionExpression?: string;
    limit?: number;
    consistentRead?: boolean;
    scanIndexForward?: boolean;
  } = {},
): Promise<QueryCommandOutput> => {
  if (
    !tableName ||
    !keyConditionExpression ||
    !isPlainObject(expressionAttributeValues) ||
    !isPlainObject(expressionAttributeNames)
  ) {
    throw new Error('queryItems: Invalid input parameters');
  }

  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    IndexName: options.indexName,
    FilterExpression: options.filterConditionExpression,
    Limit: options.limit,
    ConsistentRead: options.consistentRead,
    ScanIndexForward: options.scanIndexForward,
  };
  try {
    let lastEvaluatedKey;
    let items: Record<string, unknown>[] = [];
    do {
      const data: QueryCommandOutput = await docClient.send(
        new QueryCommand({
          ...params,
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );

      items = items.concat(data.Items ?? []);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return {
      Items: items,
      Count: items.length,
      ScannedCount: items.length,
    } as QueryCommandOutput;
  } catch (error) {
    console.error(`queryItems: ${error}`);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * 更新資料
 * @param {string} tableName 資料表名稱
 * @param {Record<string, unknown>} key 取得的資料的鍵值
 * @param {string} updateExpression 更新條件
 * @param {Record<string, string>} expressionAttributeNames 參數化更新條件名稱
 * @param {Record<string, unknown>} expressionAttributeValues 參數化更新條件
 * @param {string} returnValues 返回的屬性類型
 * @returns {Promise<UpdateCommandOutput>}
 * @throws {Error} 若更新失敗，則會拋出錯誤
 */
export const updateItem = async (
  tableName: string,
  key: Record<string, unknown>,
  updateExpression: string,
  expressionAttributeNames: Record<string, string>,
  expressionAttributeValues: Record<string, unknown>,
  returnValues: 'NONE' | 'ALL_NEW' | 'UPDATED_NEW' = 'UPDATED_NEW',
): Promise<UpdateCommandOutput> => {
  if (
    !tableName ||
    !isPlainObject(key) ||
    !updateExpression ||
    !isPlainObject(expressionAttributeNames) ||
    !isPlainObject(expressionAttributeValues)
  ) {
    throw new Error('updateItem: Invalid input parameters');
  }

  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: returnValues,
  } as UpdateCommandInput);

  console.log(`updateItem: ${JSON.stringify(command)}`);

  try {
    const data = await docClient.send(command);
    return data;
  } catch (error) {
    console.error(`updateItem: ${error}`);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * 刪除資料
 * @param {string} tableName 資料表名稱
 * @param {Record<string, unknown>} key 取得的資料的鍵值
 * @param {string} [returnValues] 返回的屬性類型
 * @returns {Promise<DeleteCommandOutput | void>}
 * @throws {Error} 若刪除失敗，則會拋出錯誤
 */
export const deleteItem = async (
  tableName: string,
  key: Record<string, unknown>,
  returnValues: 'NONE' | 'ALL_OLD' = 'ALL_OLD',
): Promise<DeleteCommandOutput> => {
  _validateInput(tableName, key);

  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
    ReturnValues: returnValues,
  } as DeleteCommandInput);

  try {
    const data = await docClient.send(command);
    return data;
  } catch (error) {
    console.error(`deleteItem: ${error}`);
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
};

export class BatchOperationDB {
  private async handleBatchWrite(requestItems: {
    [tableName: string]: Array<{ [key: string]: Record<string, unknown> }>;
  }): Promise<void> {
    const params: BatchWriteCommandInput = {
      RequestItems: requestItems,
    };

    const command = new BatchWriteCommand(params);

    try {
      const data = await docClient.send(command);
      const unprocessedItems = data.UnprocessedItems;

      if (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
        console.log('Retrying unprocessed items:', unprocessedItems);
        await this.handleBatchWrite(unprocessedItems);
      }
    } catch (error) {
      console.error(`handleBatchWrite: ${error}`);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async handleBatchGet(requestItems: {
    [tableName: string]: { Keys: Record<string, unknown>[] };
  }): Promise<{ [tableName: string]: Record<string, unknown>[] }> {
    const allResults: { [tableName: string]: Record<string, unknown>[] } = {};

    let unprocessedKeys = requestItems;

    do {
      const params: BatchGetCommandInput = {
        RequestItems: unprocessedKeys,
      };

      const command = new BatchGetCommand(params);

      try {
        const data = await docClient.send(command);

        if (data.Responses) {
          for (const tableName of Object.keys(data.Responses)) {
            if (!allResults[tableName]) {
              allResults[tableName] = [];
            }
            allResults[tableName].push(...data.Responses[tableName]);
          }
        }

        unprocessedKeys = (data.UnprocessedKeys ?? {}) as {
          [tableName: string]: { Keys: Record<string, unknown>[] };
        };
      } catch (error) {
        console.error(`handleBatchGet: ${error}`);
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
      }
    } while (Object.keys(unprocessedKeys).length > 0);

    return allResults;
  }

  /**
   * 批次刪除資料
   * @param requestItems 包含表名和鍵值對的對象
   * @returns {Promise<void>}
   * @throws {Error} 若批次刪除失敗，則會拋出錯誤
   */
  public async deleteBatchItems(requestItems: {
    [tableName: string]: Record<string, unknown>[];
  }): Promise<void> {
    const requests: {
      [tableName: string]: Array<{ DeleteRequest: { Key: Record<string, unknown> } }>;
    } = {};

    for (const tableName of Object.keys(requestItems)) {
      if (!isArrayOfObjects(requestItems[tableName])) {
        throw new Error('deleteBatchItems: Invalid input parameters');
      }

      requests[tableName] = requestItems[tableName].map((key) => ({
        DeleteRequest: { Key: key },
      }));
    }

    await this.handleBatchWrite(requests);
  }

  /**
   * 批次獲取資料
   * @param requestItems 包含表名和鍵值對的對象
   * @returns {Promise<{ [tableName: string]: Record<string, unknown>[] }>}
   * @throws {Error} 若批次獲取失敗，則會拋出錯誤
   */
  public async getBatchItems(requestItems: {
    [tableName: string]: Record<string, unknown>[];
  }): Promise<{ [tableName: string]: Record<string, unknown>[] }> {
    const requests: { [tableName: string]: { Keys: Record<string, unknown>[] } } = {};

    for (const tableName of Object.keys(requestItems)) {
      if (!isArrayOfObjects(requestItems[tableName])) {
        throw new Error('getBatchItems: Invalid input parameters');
      }

      requests[tableName] = { Keys: requestItems[tableName] };
    }

    return this.handleBatchGet(requests);
  }

  /**
   * 批次插入資料
   * @param requestItems 包含表名和要插入的項目的對象
   * @returns {Promise<void>}
   * @throws {Error} 若批次插入失敗，則會拋出錯誤
   */
  public async putBatchItems(requestItems: {
    [tableName: string]: Record<string, unknown>[];
  }): Promise<void> {
    const requests: {
      [tableName: string]: Array<{ PutRequest: { Item: Record<string, unknown> } }>;
    } = {};

    for (const tableName of Object.keys(requestItems)) {
      if (!isArrayOfObjects(requestItems[tableName])) {
        throw new Error('putBatchItems: Invalid input parameters');
      }

      requests[tableName] = requestItems[tableName].map((item) => ({
        PutRequest: { Item: item },
      }));
    }

    await this.handleBatchWrite(requests);
  }
}
