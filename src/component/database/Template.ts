import { z } from 'zod';
import { validatePhone } from '../util/DataValidator';

const studentInfoSchema = z.object({
  student_id: z
    .string()
    .min(1, { message: 'student_id is required and cannot be empty' }),
  name: z.string().default('Unknown'),
  gender: z.enum(['M', 'F', 'O']).default('O'),
  date_of_birth: z
    .string()
    .refine((date) => date === 'Unknown' || !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .default('Unknown'),
  phone: z
    .string()
    .refine((phone) => phone === 'Unknown' || validatePhone(phone), {
      message: 'Invalid phone number',
    })
    .default('Unknown'),
  email: z.string().email().default('Unknown'),
  address: z.string().default('Unknown'),
  enroll_date: z
    .string()
    .refine((date) => date === 'Unknown' || !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .default('Unknown'),
  graduate_date: z
    .string()
    .refine((date) => date === 'Unknown' || !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .default('Unknown'),
  class: z.string().default('Unknown'),
  grade: z.string().default('Unknown'),
  course: z.array(z.string()).default(['Unknown']),
  emergency_contact_name: z.string().default('Unknown'),
  emergency_contact_phone: z
    .string()
    .refine((phone) => phone === 'Unknown' || validatePhone(phone), {
      message: 'Invalid phone number',
    })
    .default('Unknown'),
  emergency_contact_relation: z.string().default('Unknown'),
  notes: z.string().default('N/A'),
});
export type StudentInfoTemplate = z.infer<typeof studentInfoSchema>;

export class StudentInfoFactory {
  static create(
    student_id: string,
    studentData: Partial<StudentInfoTemplate> = {},
  ): StudentInfoTemplate {
    return studentInfoSchema.parse({ student_id, ...studentData });
  }

  static update(
    studentData: Partial<StudentInfoTemplate>,
  ): Partial<StudentInfoTemplate> {
    return studentInfoSchema.partial().parse(studentData);
  }
}

// 定義 ParentInfo 的 zod schema
const parentInfoSchema = z.object({
  parent_id: z
    .string()
    .min(1, { message: 'parent_id is required and cannot be empty' }),
  name: z.string().default('Unknown'),
  gender: z.enum(['M', 'F', 'O']).default('O'),
  phone: z
    .string()
    .refine((phone) => phone === 'Unknown' || validatePhone(phone), {
      message: 'Invalid phone number',
    })
    .default('Unknown'),
  email: z.string().email().default('Unknown'),
  address: z.string().default('Unknown'),
  parent_line_id: z.string().default('Unknown'),
  student_list: z.array(z.string()).default(['Unknown']),
  notes: z.string().default('N/A'),
});

export type ParentInfoTemplate = z.infer<typeof parentInfoSchema>;

export class ParentInfoFactory {
  static create(
    parent_id: string,
    parentData: Partial<ParentInfoTemplate> = {},
  ): ParentInfoTemplate {
    return parentInfoSchema.parse({ parent_id, ...parentData });
  }

  static update(parentData: Partial<ParentInfoTemplate>): Partial<ParentInfoTemplate> {
    return parentInfoSchema.partial().parse(parentData);
  }
}
