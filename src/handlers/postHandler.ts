import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ResponseHelper } from './util/ResponseHelper';
import { postData } from '../component/service/postData';

export const postHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { pathParameters, body } = event;

  if (!pathParameters?.action || !pathParameters?.table) {
    return ResponseHelper.denied('Missing required path parameters');
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
      case 'postData':
        return handlePostData(table, requestBody);
      default:
        return ResponseHelper.denied('Invalid action');
    }
  } catch (error) {
    return ResponseHelper.serverError(error);
  }
};

async function handlePostData(
  table: string,
  requestBody: any,
): Promise<APIGatewayProxyResult> {
  const result = await postData(table, requestBody);
  if (result === 'Data not found') {
    return ResponseHelper.notFound('Data not found');
  }
  return ResponseHelper.success(result);
}
