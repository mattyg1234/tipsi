import { prisma } from './prismaService';

export interface DailyStats {
  venueId: string;
  venueName: string;
  requests: number;
  shots: number;
  bottles: number;
  revenue: number;
  staffBonuses: number;
  djPayouts: number;
}

export const aggregateDailyStats = async (): Promise<DailyStats[]> => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.$queryRaw<DailyStats[]>`
    SELECT 
      v.id as "venueId",
      v.name as "venueName",
      COUNT(CASE WHEN o."productType" = 'REQUEST' THEN 1 END) as requests,
      COUNT(CASE WHEN o."productType" = 'SHOTS' THEN 1 END) as shots,
      COUNT(CASE WHEN o."productType" = 'BOTTLE' THEN 1 END) as bottles,
      COALESCE(SUM(o."amountCents"), 0) as revenue,
      COALESCE(SUM(CASE WHEN o."productType" = 'SHOTS' THEN o."qty" * 100 END), 0) as "staffBonuses",
      COALESCE(SUM(CASE WHEN o."productType" = 'REQUEST' AND o."routedToConnectId" IS NOT NULL THEN o."amountCents" END), 0) as "djPayouts"
    FROM venues v
    LEFT JOIN orders o ON v.id = o."venueId" 
      AND o."createdAt" >= ${yesterday} 
      AND o."createdAt" < ${today}
      AND o.status = 'PAID'
    GROUP BY v.id, v.name
    HAVING COUNT(o.id) > 0
  `;

  return stats;
};
