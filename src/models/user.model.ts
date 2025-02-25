import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../types/user';

// ממשק TypeScript שמגדיר את השדות במודל
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profileImage?: string;
    googleId?: string;
    facebookId?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    googleId: { type: String },
    facebookId: { type: String }
}, {
    timestamps: true
});

// הצפנת סיסמה לפני שמירת המשתמש למסד הנתונים
userSchema.pre<IUser>('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// הוספת מתודה להשוואת סיסמאות
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', userSchema);
