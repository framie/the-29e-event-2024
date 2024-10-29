import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/app/db';
import { Answer } from '@/app/types';
import { AnswerModel } from '@/app/models';
import { simplify } from '@/app/utils';


export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        const answer: Answer = await request.json();
        const res = await AnswerModel.create(answer);
        const message = 'Answer has been created';
        return NextResponse.json(
            { message, res: res || {} },
            { status: HttpStatusCode.Created },
        );
    } catch (error) {
        console.log('POST error', error);
        return NextResponse.json({ message: error }, { status: HttpStatusCode.BadRequest });
    }
}

export async function GET() {
    try {
        await connectMongo();
        let res = simplify(await AnswerModel.find() || []);
        return NextResponse.json(res);
    } catch (error) {
        console.log('GET error', error);
        return NextResponse.json({ error });
    }
}

export async function DELETE() {
    try {
        await connectMongo();
        const res = await AnswerModel.deleteMany({}).exec();
        return NextResponse.json(res);
    } catch (error) {
        console.log('DELETE error', error);
        return NextResponse.json({ error });
    }
}
