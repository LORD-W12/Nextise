declare module '@prisma/client' {
    export class PrismaClient {
        course: any;
        trainer: any;
        $transaction(args: any): Promise<any>;
        $connect(): Promise<void>;
        $disconnect(): Promise<void>;
    }
}
