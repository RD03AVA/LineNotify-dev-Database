import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResponseHelper } from './util/ResponseHelper';
import { putData } from '../component/service/putData';
import { putBatchData } from '../component/service/putBatchData';

export const putHandler = async (
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
      case 'putData':
        console.log('putData', table, requestBody);
        return handlePutData(table, requestBody);
      case 'putBatchData':
        return handlePutBatchData(requestBody);
      default:
        return ResponseHelper.denied('Invalid action');
    }
  } catch (error) {
    return ResponseHelper.serverError(error);
  }
};

async function handlePutData(
  table: string | undefined,
  requestBody: any,
): Promise<APIGatewayProxyResult> {
  if (!table) {
    return ResponseHelper.denied('Missing table parameter');
  }
  const result = await putData(table, requestBody);
  return ResponseHelper.success(result);
}

async function handlePutBatchData(requestBody: any): Promise<APIGatewayProxyResult> {
  const result = await putBatchData(requestBody);
  return ResponseHelper.success(result);
}
