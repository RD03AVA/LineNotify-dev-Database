import { APIGatewayProxyResult } from 'aws-lambda';

interface ResponseBody {
  message?: string;
  error?: string;
  result?: unknown;
  [key: string]: unknown;
}

/**
 * Helper class for creating standardized API responses.
 */
export class ResponseHelper {
  /**
   * Creates a response for a denied request.
   */
  static denied(message: string, error?: unknown): APIGatewayProxyResult {
    return createResponse(400, message, error);
  }

  /**
   * Creates a response for a server error.
   */
  static serverError(error: unknown): APIGatewayProxyResult {
    return createResponse(500, 'Internal Server Error', error);
  }

  /**
   * Creates a response for a not found error.
   */
  static notFound(message: string, error?: unknown): APIGatewayProxyResult {
    return createResponse(404, message, error);
  }

  /**
   * Creates a response for a successful operation.
   */
  static success(result: unknown): APIGatewayProxyResult {
    return createResponse(200, 'Success', undefined, result);
  }
}

/**
 * Creates a standardized API response.
 */
function createResponse(
  statusCode: number,
  message: string | object,
  error?: unknown,
  result?: unknown,
): APIGatewayProxyResult {
  const body: ResponseBody = typeof message === 'object' ? { ...message } : { message };

  if (error !== undefined) {
    body.error = error instanceof Error ? error.message : String(error);
  }

  if (result !== undefined) {
    body.result = result;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
