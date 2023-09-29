import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: string;
}

const userSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
