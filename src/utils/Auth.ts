export interface User {
  documentId: string;
  email: string;
  firstname: string;
  lastname: string;
  role: RolesEnum;
  profilePicture?: string;
}

export interface CreateUserInput {
  email: string;
  firstname: string;
  lastname: string;
  role: RolesEnum;
  profilePicture?: string;
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER'
}