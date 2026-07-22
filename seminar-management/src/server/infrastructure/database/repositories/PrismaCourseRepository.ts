import { PrismaClient } from '@prisma/client';
import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course, CourseStatus } from '@server/domain/entities/Course';

type PrismaCourseWithTrainer = {
    id: string;
    name: string;
    date: Date;
    endDate: Date | null;
    subject: string;
    location: string;
    participants: number;
    notes: string;
    price: number;
    trainerPrice: number;
    status: string;
    trainerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    trainer: {
        id: string;
        name: string;
        subjects: string;
        location: string;
        email: string;
        availability: string;
        hourlyRate: number | null;
        rating: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;
};

export class PrismaCourseRepository implements ICourseRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private mapToDomain(row: PrismaCourseWithTrainer): Course {
        return {
            id: row.id,
            name: row.name,
            date: row.date,
            endDate: row.endDate ?? undefined,
            subject: JSON.parse(row.subject) as string[],
            location: row.location,
            participants: row.participants,
            notes: row.notes,
            price: row.price,
            trainerPrice: row.trainerPrice,
            status: row.status as CourseStatus,
            trainerId: row.trainerId ?? undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            trainer: row.trainer
                ? {
                    id: row.trainer.id,
                    name: row.trainer.name,
                    subjects: JSON.parse(row.trainer.subjects) as string[],
                    location: row.trainer.location,
                    email: row.trainer.email,
                    availability: row.trainer.availability,
                    hourlyRate: row.trainer.hourlyRate ?? undefined,
                    rating: row.trainer.rating ?? undefined,
                    createdAt: row.trainer.createdAt,
                    updatedAt: row.trainer.updatedAt,
                }
                : undefined,
        };
    }

    async findAll(): Promise<Course[]> {
        const rows = await this.prisma.course.findMany({
            include: { trainer: true },
            orderBy: { date: 'asc' },
        });
        return rows.map((r: any) => this.mapToDomain(r as any));
    }

    async findById(id: string): Promise<Course | null> {
        const row = await this.prisma.course.findUnique({
            where: { id },
            include: { trainer: true },
        });
        return row ? this.mapToDomain(row as any) : null;
    }

    async findByTrainerId(trainerId: string): Promise<Course[]> {
        const rows = await this.prisma.course.findMany({
            where: { trainerId },
            include: { trainer: true },
        });
        return rows.map((r: any) => this.mapToDomain(r as any));
    }

    async create(course: Omit<Course, 'id' | 'trainer' | 'createdAt' | 'updatedAt'>): Promise<Course> {
        const created = await this.prisma.course.create({
            data: {
                name: course.name,
                date: course.date,
                endDate: course.endDate,
                subject: JSON.stringify(course.subject),
                location: course.location,
                participants: course.participants,
                notes: course.notes,
                price: course.price,
                trainerPrice: course.trainerPrice,
                status: course.status,
                trainerId: course.trainerId,
            },
            include: { trainer: true },
        });
        return this.mapToDomain(created as any);
    }

    async update(id: string, course: Partial<Omit<Course, 'id' | 'trainer'>>): Promise<Course> {
        const updated = await this.prisma.course.update({
            where: { id },
            data: {
                ...(course.name !== undefined && { name: course.name }),
                ...(course.date !== undefined && { date: course.date }),
                ...(course.endDate !== undefined && { endDate: course.endDate }),
                ...(course.subject !== undefined && { subject: JSON.stringify(course.subject) }),
                ...(course.location !== undefined && { location: course.location }),
                ...(course.participants !== undefined && { participants: course.participants }),
                ...(course.notes !== undefined && { notes: course.notes }),
                ...(course.price !== undefined && { price: course.price }),
                ...(course.trainerPrice !== undefined && { trainerPrice: course.trainerPrice }),
                ...(course.status !== undefined && { status: course.status }),
                ...(course.trainerId !== undefined && { trainerId: course.trainerId }),
            },
            include: { trainer: true },
        });
        return this.mapToDomain(updated as any);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.course.delete({ where: { id } });
    }
}
