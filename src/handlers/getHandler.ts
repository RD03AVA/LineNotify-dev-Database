import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResponseHelper } from './util/ResponseHelper';
import { getData } from '../component/service/getData';
import { queryData } from '../component/service/queryData';
import { deleteData } from '../component/service/deleteData';
import { getBatchData } from '../component/service/getBatchData';
import { isEmptyObject } from '../component/util/DataValidator';

export const getHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, queryStringParameters, body } = event;

  if (!pathParameters?.action) {
    return ResponseHelper.denied('Missing required action parameter');
  }

  const { action, table } = pathParameters;

  let requestBody: any;
  try {
    requestBody = body ? JSON.parse(body) : {};
  } catch (error) {
    return ResponseHelper.denied('Invalid JSON in request body');
  }

  try {
    switch (action) {
      case 'getData':
        return handleGetData(table, queryStringParameters?.id, requestBody.id);
      case 'queryData':
        return handleQueryData(table, requestBody);
      case 'deleteData':
        return handleDeleteData(table, queryStringParameters?.id);
      case 'getBatchData':
        return handleGetBatchData(requestBody);
      default:
        return ResponseHelper.denied('Invalid action');
    }
  } catch (error) {
    return ResponseHelper.serverError(error);
  }
};

async function handleGetData(
  table: string | undefined,
  queryId?: string,
  bodyId?: string,
): Promise<APIGatewayProxyResult> {
  if (!table) {
    return ResponseHelper.denied('Missing table parameter');
  }
  const id = queryId || bodyId;
  if (!id) {
    return ResponseHelper.denied('Missing id');
  }
  const result = await getData(table, id);
  return isEmptyObject(result)
    ? ResponseHelper.notFound('Data not found')
    : ResponseHelper.success(result);
}

async function handleQueryData(
  table: string | undefined,
  requestBody: any,
): Promise<APIGatewayProxyResult> {
  if (!table) {
    return ResponseHelper.denied('Missing table parameter');
  }
  if (!requestBody.conditions) {
    return ResponseHelper.denied('Missing conditions in request body');
  }
  const result = await queryData(table, requestBody);
  return isEmptyObject(result)
    ? ResponseHelper.notFound('Data not found')
    : ResponseHelper.success(result);
}

async function handleDeleteData(
  table: string | undefined,
  id?: string,
): Promise<APIGatewayProxyResult> {
  if (!table) {
    return ResponseHelper.denied('Missing table parameter');
  }
  if (!id) {
    return ResponseHelper.denied('Missing id');
  }
  const result = await deleteData(table, id);
  return ResponseHelper.success(result);
}

async function handleGetBatchData(requestBody: any): Promise<APIGatewayProxyResult> {
  if (isEmptyObject(requestBody)) {
    return ResponseHelper.denied('Missing request body');
  }
  const result = await getBatchData(requestBody);
  return isEmptyObject(result)
    ? ResponseHelper.notFound('Data not found')
    : ResponseHelper.success(result);
}
