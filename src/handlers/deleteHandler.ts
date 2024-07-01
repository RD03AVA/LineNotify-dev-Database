import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResponseHelper } from './util/ResponseHelper';
import { deleteData } from '../component/service/deleteData';
import { deleteBatchData } from '../component/service/deleteBatchData';
import { isString } from '../component/util/DataValidator';

export const deleteHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, body } = event;

  if (!pathParameters?.action) {
    return ResponseHelper.denied('Missing required action parameter');
  }

  const { action, table } = pathParameters;

  if (!body) {
    return ResponseHelper.denied('Missing request body');
  }

  let requestBody: any;
  try {
    requestBody = JSON.parse(body);
  } catch (error) {
    return ResponseHelper.denied('Invalid JSON in request body');
  }

  try {
    switch (action) {
      case 'deleteData':
        return handleDeleteData(table, requestBody);
      case 'deleteBatchData':
        return handleDeleteBatchData(requestBody);
      default:
        return ResponseHelper.denied('Invalid action');
    }
  } catch (error) {
    return ResponseHelper.serverError(error);
  }
};

async function handleDeleteData(
  table: string | undefined,
  requestBody: any,
): Promise<APIGatewayProxyResult> {
  if (!table) {
    return ResponseHelper.denied('Missing table parameter');
  }
  const { id } = requestBody;
  if (!id || !isString(id)) {
    return ResponseHelper.denied('Missing or invalid id');
  }
  const result = await deleteData(table, id);
  return ResponseHelper.success(result);
}

async function handleDeleteBatchData(requestBody: any): Promise<APIGatewayProxyResult> {
  const result = await deleteBatchData(requestBody);
  return ResponseHelper.success(result);
}
