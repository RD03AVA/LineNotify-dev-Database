import { updateItem } from '../database/DynamoDB';
import { StudentInfoFactory, ParentInfoFactory } from '../database/Template';

const _createExpression = (data: any) => {
  const updateExpParts: string[] = [];
  const expNames: { [key: string]: string } = {};
  const expValues: { [key: string]: any } = {};

  Object.entries(data).forEach(([field, value], index) => {
    if (value !== undefined && field !== 'student_id' && field !== 'parent_id') {
      const expKey = `#field${index}`;
      const expValue = `:value${index}`;
      updateExpParts.push(`${expKey} = ${expValue}`);
      expNames[expKey] = field;
      expValues[expValue] = value;
    }
  });

  const updateExp = `set ${updateExpParts.join(', ')}`;
  return { updateExp, expNames, expValues };
};

const _validateData = (tableName: string, requestBody: any) => {
  const validatedData: any = {};

  switch (tableName) {
    case 'Dev_LineNotify_UserInfo': {
      const partialData = StudentInfoFactory.update(requestBody);
      Object.entries(partialData).forEach(([key, value]) => {
        if (value !== 'Unknown' && value !== 'N/A' && value !== undefined) {
          validatedData[key] = value;
        }
      });
      break;
    }
    case 'Dev_LineNotify_ParentInfo': {
      const partialData = ParentInfoFactory.update(requestBody);
      Object.entries(partialData).forEach(([key, value]) => {
        if (value !== 'Unknown' && value !== 'N/A' && value !== undefined) {
          validatedData[key] = value;
        }
      });
      break;
    }
    default:
      throw new Error('Invalid table name');
  }
  return validatedData;
};

const _getKey = (tableName: string, requestBody: any) => {
  switch (tableName) {
    case 'Dev_LineNotify_UserInfo':
      return { student_id: requestBody.student_id };
    case 'Dev_LineNotify_ParentInfo':
      return { parent_id: requestBody.parent_id };
    default:
      throw new Error('Invalid table name');
  }
};

export const postData = async (tableName: string, body: any): Promise<string> => {
  try {
    const validatedData = _validateData(tableName, body);
    const key = _getKey(tableName, body);
    const { updateExp, expNames, expValues } = _createExpression(validatedData);

    const data = await updateItem(tableName, key, updateExp, expNames, expValues);
    if (!data.Attributes) {
      return 'No data found';
    }
    return `${tableName} data has been updated successfully`;
  } catch (error) {
    console.error('postData:', error);
    throw new Error('Error while updating data');
  }
};
