import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/app/db';
import { Lobby, User } from '@/app/types';
import { LobbyModel } from '@/app/models';
import { simplify } from '@/app/utils';


export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const lobby: Lobby = await request.json();
        const query = { name: lobby.name };
        const res = await LobbyModel.findOneAndUpdate(query, lobby, {upsert: true});
        let message;
        if (res) {
            message = `Lobby with name ${lobby.name} already exists`;
        } else {
            message = 'Lobby has been created';
        }
        return NextResponse.json(
            { message, res: res || {} },
            { status: HttpStatusCode.Created },
        );
    } catch (error) {
        console.log('POST error', error);
        return NextResponse.json({ message: error }, { status: HttpStatusCode.BadRequest });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectMongo();
        const lobby: Lobby = await request.json();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const query = { name };
        if ('messages' in lobby) {
            const newLobby = new LobbyModel({
                name: lobby.name,
                users: lobby.users,
                currentGame: lobby.currentGame,
                messages: {}
            })
            Object.entries(lobby.messages as any).forEach(([key, val]) => {
                newLobby.messages.set(key, val);
            });
            lobby.messages = newLobby.messages
        }
        const res = await LobbyModel.findOneAndUpdate(query, lobby);
        const message = `Lobby with name ${name} updated with data ${JSON.stringify(lobby)}`;
        return NextResponse.json(
            { message, res: simplify(res) || {} },
            { status: HttpStatusCode.Created },
        );
    } catch (error) {
        console.log('PUT error', error);
        return NextResponse.json({ message: error }, { status: HttpStatusCode.BadRequest });
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectMongo();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        let res;
        if (name) {
            res = simplify(await LobbyModel.findOne({ name }).exec() || {});
        } else {
            res = simplify(await LobbyModel.find() || []);
        }
        return NextResponse.json(res);
    } catch (error) {
        console.log('GET error', error);
        return NextResponse.json({ error });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectMongo();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        if (!name) {
            const message = 'Must provide name as request param';
            console.log('POST error', message);
            return NextResponse.json({ message }, { status: HttpStatusCode.BadRequest });
        }
        const res = await LobbyModel.findOneAndDelete({ name }).exec();
        return NextResponse.json(res);
    } catch (error) {
        console.log('DELETE error', error);
        return NextResponse.json({ error });
    }
}
