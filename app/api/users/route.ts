import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/app/db';
import { User } from '@/app/types';
import { UserModel } from '@/app/models';
import { simplify } from '@/app/utils';


export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const user: User = await request.json();
        user['active'] = true;
        const query = { name: user.name };
        const res = await UserModel.findOneAndUpdate(query, user, {upsert: true});
        let message;
        if (res) {
            message = `User with name ${user.name} already exists`;
        } else {
            message = 'User has been created';
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
        const user: User = await request.json();
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');
        const query = { name };
        const res = await UserModel.findOneAndUpdate(query, user);
        const message = `User with name ${user.name} updated with data ${JSON.stringify(user)}`;
        return NextResponse.json(
            { message, res: res || {} },
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
            res = simplify(await UserModel.findOne({ name }).exec() || {});
        } else {
            res = simplify(await UserModel.find() || []);
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
        const res = await UserModel.findOneAndDelete({ name }).exec();
        return NextResponse.json(res);
    } catch (error) {
        console.log('DELETE error', error);
        return NextResponse.json({ error });
    }
}
