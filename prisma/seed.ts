// Seed script for TCTP - India Nightlife data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🇮🇳 Seeding TCTP database with India-wide nightlife data...\n');

    // 1. Setup Cities
    console.log('🌍 Setting up cities...');
    const goa = await prisma.city.upsert({
        where: { slug: 'goa' },
        update: {},
        create: { name: 'Goa', slug: 'goa', active: true },
    });
    const mumbai = await prisma.city.upsert({
        where: { slug: 'mumbai' },
        update: {},
        create: { name: 'Mumbai', slug: 'mumbai', active: true },
    });
    const bangalore = await prisma.city.upsert({
        where: { slug: 'bangalore' },
        update: {},
        create: { name: 'Bangalore', slug: 'bangalore', active: true },
    });

    // 2. Setup Venues
    console.log('📍 Setting up venues...');
    const hilltop = await prisma.venue.upsert({
        where: { id: 'hilltop-goa' },
        update: {},
        create: {
            id: 'hilltop-goa',
            name: 'Hilltop',
            cityId: goa.id,
            address: 'Vagator Hill, Anjuna',
            mapUrl: 'https://maps.google.com/?q=Hilltop+Goa',
        },
    });

    const antiSocial = await prisma.venue.upsert({
        where: { id: 'antisocial-mumbai' },
        update: {},
        create: {
            id: 'antisocial-mumbai',
            name: 'AntiSocial',
            cityId: mumbai.id,
            address: 'CS #242, Near Mathuradas Mill Compound, Lower Parel',
            mapUrl: 'https://maps.google.com/?q=AntiSocial+Mumbai',
        },
    });

    // 3. Setup DJs
    console.log('🎧 Setting up DJs...');
    await prisma.dJ.upsert({
        where: { id: 'kohra-dj' },
        update: {},
        create: {
            id: 'kohra-dj',
            name: 'Kohra',
            cityId: goa.id,
            genres: 'techno,dark techno',
            vibeTags: 'dark,warehouse,hypnotic',
        },
    });

    console.log('🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
