import { ParentInfoFactory, StudentInfoFactory } from '../database/Template';
import { putItem } from '../database/DynamoDB';

const _createNewData = (tableName: string, body: any) => {
  switch (tableName) {
    case 'Dev_LineNotify_UserInfo':
      return StudentInfoFactory.create(body.student_id, {
        name: body.name,
        gender: body.gender,
        date_of_birth: body.date_of_birth,
        phone: body.phone,
        email: body.email,
        address: body.address,
        enroll_date: body.enroll_date,
        graduate_date: body.graduate_date,
        class: body.class,
        grade: body.grade,
        course: body.course,
        emergency_contact_name: body.emergency_contact_name,
        emergency_contact_phone: body.emergency_contact_phone,
        emergency_contact_relation: body.emergency_contact_relation,
        notes: body.notes,
      });
    case 'Dev_LineNotify_ParentInfo':
      return ParentInfoFactory.create(body.parent_id, {
        name: body.name,
        gender: body.gender,
        phone: body.phone,
        email: body.email,
        address: body.address,
        parent_line_id: body.parent_line_id,
        student_list: body.student_list,
        notes: body.notes,
      });
    default:
      throw new Error('Invalid table name');
  }
};

export const putData = async (tableName: string, body: any): Promise<string> => {
  try {
    const newData = _createNewData(tableName, body);

    await putItem(tableName, newData);

    return `${tableName} data has been added successfully`;
  } catch (error) {
    console.error('putData:', error);
    throw new Error('Error while adding data');
  }
};
