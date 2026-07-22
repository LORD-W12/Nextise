// External email service contract - pure TypeScript interface
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export interface IEmailService {
    send(payload: EmailPayload): Promise<void>;
}
