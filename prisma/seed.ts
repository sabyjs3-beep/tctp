import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
    { name: 'Goa', slug: 'goa' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'New Delhi', slug: 'delhi' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Jaipur', slug: 'jaipur' },
    { name: 'Chandigarh', slug: 'chandigarh' },
    { name: 'Gurgaon', slug: 'gurgaon' },
    { name: 'Noida', slug: 'noida' }
];

async function main() {
    console.log('🌱 Starting seed...');

    for (const city of cities) {
        const result = await prisma.city.upsert({
            where: { slug: city.slug },
            update: {}, // No updates, just ensure it exists
            create: {
                name: city.name,
                slug: city.slug,
                active: true
            }
        });
        console.log(`✅ Ensured city: ${result.name} (${result.slug})`);
    }

    console.log('🏁 Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
