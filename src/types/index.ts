export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlogPost {
  _id?: string;
  title: string;
  content: string;
  author: string; // User ID
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
}