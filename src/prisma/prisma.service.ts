import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Exports a single instance of the Prisma Client so
 * that other areas of the code do not have to
 * instantiate their own instances.
 */
@Injectable()
export class PrismaService extends PrismaClient {}
