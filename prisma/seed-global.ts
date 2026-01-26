import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Global Cities...');

    const cities = [
        { name: 'Goa', slug: 'goa' },
        { name: 'Mumbai', slug: 'mumbai' },
        { name: 'Bangalore', slug: 'bangalore' },
        { name: 'Delhi NCR', slug: 'delhi' },
        { name: 'Pune', slug: 'pune' },
        { name: 'Hyderabad', slug: 'hyderabad' },
    ];

    for (const city of cities) {
        const upserted = await (prisma as any).city.upsert({
            where: { slug: city.slug },
            update: { name: city.name, active: true },
            create: {
                name: city.name,
                slug: city.slug,
                active: true,
            },
        });
        console.log(`✅ ${upserted.name} (${upserted.slug})`);
    }

    console.log('🏁 Global city seeding complete.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
