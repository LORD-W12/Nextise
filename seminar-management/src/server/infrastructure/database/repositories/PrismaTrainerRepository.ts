import { PrismaClient } from '@prisma/client';
import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { Trainer } from '@server/domain/entities/Trainer';

export class PrismaTrainerRepository implements ITrainerRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private mapToDomain(row: {
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
    }): Trainer {
        return {
            id: row.id,
            name: row.name,
            subjects: JSON.parse(row.subjects) as string[],
            location: row.location,
            email: row.email,
            availability: row.availability,
            hourlyRate: row.hourlyRate ?? undefined,
            rating: row.rating ?? undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    async findAll(): Promise<Trainer[]> {
        const rows = await this.prisma.trainer.findMany({ orderBy: { name: 'asc' } });
        return rows.map((r: any) => this.mapToDomain(r as any));
    }

    async findById(id: string): Promise<Trainer | null> {
        const row = await this.prisma.trainer.findUnique({ where: { id } });
        return row ? this.mapToDomain(row) : null;
    }

    async create(trainer: Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trainer> {
        const created = await this.prisma.trainer.create({
            data: {
                name: trainer.name,
                subjects: JSON.stringify(trainer.subjects),
                location: trainer.location,
                email: trainer.email,
                availability: trainer.availability ?? '[]',
                hourlyRate: trainer.hourlyRate,
                rating: trainer.rating,
            },
        });
        return this.mapToDomain(created);
    }

    async update(id: string, trainer: Partial<Omit<Trainer, 'id'>>): Promise<Trainer> {
        const updateData: Record<string, unknown> = {};
        if (trainer.name !== undefined) updateData.name = trainer.name;
        if (trainer.subjects !== undefined) updateData.subjects = JSON.stringify(trainer.subjects);
        if (trainer.location !== undefined) updateData.location = trainer.location;
        if (trainer.email !== undefined) updateData.email = trainer.email;
        if (trainer.availability !== undefined) updateData.availability = trainer.availability;
        if (trainer.hourlyRate !== undefined) updateData.hourlyRate = trainer.hourlyRate;
        if (trainer.rating !== undefined) updateData.rating = trainer.rating;

        const updated = await this.prisma.trainer.update({ where: { id }, data: updateData });
        return this.mapToDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.trainer.delete({ where: { id } });
    }
}
