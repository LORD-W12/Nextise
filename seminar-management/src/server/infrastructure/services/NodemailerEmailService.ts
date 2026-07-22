/**
 * Infrastructure: Nodemailer Email Service
 * Implements IEmailService via Nodemailer/SMTP (Mailhog compatible)
 */
import nodemailer from 'nodemailer';
import { IEmailService, EmailPayload } from '@server/domain/services/IEmailService';

export class NodemailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'localhost',
            port: Number(process.env.SMTP_PORT) || 1025,
            secure: false, // Mailhog does not use TLS
            auth: process.env.SMTP_USER
                ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
                : undefined,
        });
    }

    async send(payload: EmailPayload): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM || '"Kodschul Hub" <noreply@seminar-hub.local>',
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });
    }
}
