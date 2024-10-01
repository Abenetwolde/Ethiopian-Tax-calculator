import mongoose, { Document, Schema } from 'mongoose';

// Define the User interface extending Document
export interface User extends Document {
  firstname: string;
  username?: string;
  telegramId: number;
  rate?: number;
  grossSalaries: number[]; 
}

// Create a schema for the User
const userSchema: Schema<User> = new Schema({
  firstname: { type: String, required: true },
  username: { type: String, required: false },
  telegramId: { type: Number, required: true, unique: true },
  rate: { type: Number, required: false },
  grossSalaries: { type: [Number], required: false },
});

// Create the User model
export const UserModel = mongoose.model<User>('User', userSchema);
