import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { ResponseHelper } from './handlers/util/ResponseHelper';
import { getHandler } from './handlers/getHandler';
import { postHandler } from './handlers/postHandler';
import { putHandler } from './handlers/putHandler';
import { deleteHandler } from './handlers/deleteHandler';

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: any,
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod.toUpperCase();
    switch (method) {
      case 'GET':
        return getHandler(event);
      case 'PUT':
        return putHandler(event);
      case 'POST':
        return postHandler(event);
      case 'DELETE':
        return deleteHandler(event);
      default:
        return ResponseHelper.denied('Invalid request', 'Method not allowed');
    }
  } catch (error) {
    console.error(error);
    return ResponseHelper.serverError(error);
  }
};
