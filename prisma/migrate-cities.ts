import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌍 Setting up Cities...');
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

    // 1. Create Goa
    const goa = await prisma.city.upsert({
        where: { slug: 'goa' },
        update: {},
        create: {
            name: 'Goa',
            slug: 'goa',
            active: true,
        },
    });
    console.log('✅ Created/Found City: Goa');

    // 2. Create Mumbai
    await prisma.city.upsert({
        where: { slug: 'mumbai' },
        update: {},
        create: {
            name: 'Mumbai',
            slug: 'mumbai',
            active: true,
        },
    });
    console.log('✅ Created/Found City: Mumbai');

    // 3. Migrate existing Venues to Goa
    if ((prisma as any).venue) {
        const venueUpdate = await prisma.venue.updateMany({
            where: { cityId: null },
            data: { cityId: goa.id },
        });
        console.log(`✅ Linked ${venueUpdate?.count ?? 0} venues to Goa`);
    }

    // 4. Migrate existing DJs to Goa
    // Check both dj and dJ
    const djModel = (prisma as any).dj || (prisma as any).dJ;
    if (djModel) {
        const djUpdate = await djModel.updateMany({
            where: { cityId: null },
            data: { cityId: goa.id },
        });
        console.log(`✅ Linked ${djUpdate?.count ?? 0} DJs to Goa`);
    } else {
        console.log('⚠️ DJ model not found in Prisma client');
    }
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
