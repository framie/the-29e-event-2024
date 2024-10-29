import { model, models, Schema } from 'mongoose';
import { Answer, Lobby, User } from './types';

const LobbySchema = new Schema<Lobby>(
    {
        name: String,
        users: [String],
        currentGame: String,
        messages: {
            type: Map,
            of: [String],
            default: undefined,
        },
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                delete ret._id;
            },
        },
    },
);
export const LobbyModel = models.Lobby || model('Lobby', LobbySchema);

const UserSchema = new Schema<User>(
    {
        name: String,
        active: Boolean,
        points: Number,
        wins: Number,
        losses: Number,
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                delete ret._id;
            },
        },
    },
);
export const UserModel = models.User || model('User', UserSchema);

const AnswerSchema = new Schema<Answer>(
    {
        name: String,
        message: String,
        game: String,
        question: String,
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                delete ret._id;
            },
        },
    },
);
export const AnswerModel = models.Answer || model('Answer', AnswerSchema);
