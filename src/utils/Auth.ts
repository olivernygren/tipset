export interface User {
  documentId: string;
  email: string;
  firstname: string;
  lastname: string;
  role: RolesEnum;
}

export interface CreateUserInput {
  email: string;
  firstname: string;
  lastname: string;
  role: RolesEnum;
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER'
}