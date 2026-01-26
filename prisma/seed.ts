// Seed script for TCTP - Goa nightlife data
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌴 Seeding TCTP database with Goa nightlife data...\n');

    // Clear existing data
    await prisma.postVote.deleteMany();
    await prisma.post.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.presence.deleteMany();
    await prisma.eventDJ.deleteMany();
    await prisma.event.deleteMany();
    await prisma.dJ.deleteMany();
    await prisma.venue.deleteMany();
    await prisma.rateLimit.deleteMany();

    console.log('✓ Cleared existing data\n');

    // Create Venues
    const venues = await Promise.all([
        prisma.venue.create({
            data: {
                name: 'Club Cubana',
                city: 'Goa',
                address: 'Arpora Hill, Arpora',
                mapUrl: 'https://maps.google.com/?q=Club+Cubana+Goa',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Hilltop',
                city: 'Goa',
                address: 'Vagator Hill, Anjuna',
                mapUrl: 'https://maps.google.com/?q=Hilltop+Goa',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Chronicle',
                city: 'Goa',
                address: 'Vagator Beach Road, Vagator',
                mapUrl: 'https://maps.google.com/?q=Chronicle+Goa',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Curlies',
                city: 'Goa',
                address: 'Anjuna Beach',
                mapUrl: 'https://maps.google.com/?q=Curlies+Anjuna',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Shiva Valley',
                city: 'Goa',
                address: 'Anjuna Beach Road',
                mapUrl: 'https://maps.google.com/?q=Shiva+Valley+Goa',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'Waters Beach Lounge',
                city: 'Goa',
                address: 'Vagator Beach',
                mapUrl: 'https://maps.google.com/?q=Waters+Beach+Lounge',
            },
        }),
        prisma.venue.create({
            data: {
                name: 'The Secret Garden',
                city: 'Goa',
                address: 'Morjim',
                mapUrl: 'https://maps.google.com/?q=Secret+Garden+Morjim',
            },
        }),
    ]);

    console.log(`✓ Created ${venues.length} venues\n`);

    // Create DJs
    const djs = await Promise.all([
        prisma.dJ.create({
            data: {
                name: 'Kohra',
                city: 'Goa',
                genres: 'techno,dark techno',
                vibeTags: 'dark,warehouse,hypnotic',
                soundcloud: 'https://soundcloud.com/koloraturamusic',
                instagram: '@koloraturamusic',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Arjun Vagale',
                city: 'Mumbai',
                genres: 'techno,progressive',
                vibeTags: 'driving,melodic,peak-time',
                soundcloud: 'https://soundcloud.com/arjunvagale',
                instagram: '@arjunvagale',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Ankytrixx',
                city: 'Goa',
                genres: 'psytrance,progressive',
                vibeTags: 'psychedelic,high-energy,sunrise',
                soundcloud: 'https://soundcloud.com/ankytrixx',
                instagram: '@ankytrixx',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Grain',
                city: 'Delhi',
                genres: 'house,deep house',
                vibeTags: 'groovy,chill,sunset',
                soundcloud: 'https://soundcloud.com/grainmusic',
                instagram: '@grain.music',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Calm Chor',
                city: 'Goa',
                genres: 'tech house,minimal',
                vibeTags: 'groovy,late-night,underground',
                soundcloud: 'https://soundcloud.com/calmchor',
                instagram: '@calmchor',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Vinayak^A',
                city: 'Goa',
                genres: 'psytrance,full-on',
                vibeTags: 'psychedelic,high-energy,morning',
                soundcloud: 'https://soundcloud.com/vinayaka',
                instagram: '@vinayak_a',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'BLOT!',
                city: 'Delhi',
                genres: 'techno,electro',
                vibeTags: 'dark,industrial,peak-time',
                soundcloud: 'https://soundcloud.com/blotmusic',
                instagram: '@blot.music',
            },
        }),
        prisma.dJ.create({
            data: {
                name: 'Hamza Rahimtula',
                city: 'Mumbai',
                genres: 'disco,house',
                vibeTags: 'funky,groovy,sunset',
                soundcloud: 'https://soundcloud.com/hamzarahimtula',
                instagram: '@hamzarahimtula',
            },
        }),
    ]);

    console.log(`✓ Created ${djs.length} DJs\n`);

    // Create Events (next few days)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const events = await Promise.all([
        // Tonight - 10pm
        prisma.event.create({
            data: {
                title: 'Dark Matter',
                description: 'A night of dark, hypnotic techno',
                startTime: new Date(today.getTime() + 22 * 60 * 60 * 1000), // 10pm today
                endTime: new Date(today.getTime() + 28 * 60 * 60 * 1000), // 4am
                venueId: venues[0].id, // Club Cubana
                vibeTags: 'dark,warehouse,hypnotic',
                ctaType: 'pay_at_venue',
                sourceType: 'community',
                status: 'live',
            },
        }),
        // Tonight - 11pm
        prisma.event.create({
            data: {
                title: 'Sunset to Sunrise',
                description: 'Progressive journey from sunset vibes to morning madness',
                startTime: new Date(today.getTime() + 23 * 60 * 60 * 1000), // 11pm today
                endTime: new Date(today.getTime() + 34 * 60 * 60 * 1000), // 10am next day
                venueId: venues[1].id, // Hilltop
                vibeTags: 'psychedelic,high-energy,sunrise',
                ctaType: 'pay_at_venue',
                sourceType: 'community',
                status: 'live',
            },
        }),
        // Tomorrow
        prisma.event.create({
            data: {
                title: 'Groove Theory',
                description: 'Deep house and disco vibes by the beach',
                startTime: new Date(today.getTime() + (24 + 17) * 60 * 60 * 1000), // 5pm tomorrow
                endTime: new Date(today.getTime() + (24 + 23) * 60 * 60 * 1000), // 11pm tomorrow
                venueId: venues[5].id, // Waters Beach Lounge
                vibeTags: 'groovy,chill,sunset',
                ctaType: 'pay_at_venue',
                sourceType: 'verified',
                status: 'created',
            },
        }),
        // Weekend
        prisma.event.create({
            data: {
                title: 'Underground Sessions',
                description: 'Minimal techno and tech house',
                startTime: new Date(today.getTime() + (48 + 22) * 60 * 60 * 1000), // Day after tomorrow 10pm
                endTime: new Date(today.getTime() + (48 + 28) * 60 * 60 * 1000),
                venueId: venues[2].id, // Chronicle
                vibeTags: 'underground,minimal,late-night',
                ctaType: 'external_ticket',
                ticketUrl: 'https://insider.in/example',
                sourceType: 'community',
                status: 'created',
            },
        }),
        // Weekend
        prisma.event.create({
            data: {
                title: 'Full Moon Party',
                description: 'Monthly full moon celebration with psytrance',
                startTime: new Date(today.getTime() + (72 + 20) * 60 * 60 * 1000), // 3 days from now
                endTime: new Date(today.getTime() + (72 + 32) * 60 * 60 * 1000),
                venueId: venues[4].id, // Shiva Valley
                vibeTags: 'psychedelic,high-energy,outdoor',
                ctaType: 'pay_at_venue',
                sourceType: 'verified',
                status: 'created',
            },
        }),
    ]);

    console.log(`✓ Created ${events.length} events\n`);

    // Link DJs to Events
    await Promise.all([
        // Dark Matter
        prisma.eventDJ.create({ data: { eventId: events[0].id, djId: djs[0].id, order: 0 } }),
        prisma.eventDJ.create({ data: { eventId: events[0].id, djId: djs[6].id, order: 1 } }),

        // Sunset to Sunrise
        prisma.eventDJ.create({ data: { eventId: events[1].id, djId: djs[2].id, order: 0 } }),
        prisma.eventDJ.create({ data: { eventId: events[1].id, djId: djs[5].id, order: 1 } }),

        // Groove Theory
        prisma.eventDJ.create({ data: { eventId: events[2].id, djId: djs[7].id, order: 0 } }),
        prisma.eventDJ.create({ data: { eventId: events[2].id, djId: djs[3].id, order: 1 } }),

        // Underground Sessions
        prisma.eventDJ.create({ data: { eventId: events[3].id, djId: djs[4].id, order: 0 } }),
        prisma.eventDJ.create({ data: { eventId: events[3].id, djId: djs[1].id, order: 1 } }),

        // Full Moon Party
        prisma.eventDJ.create({ data: { eventId: events[4].id, djId: djs[2].id, order: 0 } }),
        prisma.eventDJ.create({ data: { eventId: events[4].id, djId: djs[5].id, order: 1 } }),
    ]);

    console.log('✓ Linked DJs to events\n');

    // Add some sample votes to the live events
    const sampleDevices = ['device_1', 'device_2', 'device_3', 'device_4', 'device_5', 'device_6', 'device_7'];

    // Votes for Dark Matter (mostly positive)
    for (const device of sampleDevices.slice(0, 6)) {
        await prisma.vote.create({
            data: {
                eventId: events[0].id,
                deviceId: device,
                module: 'legit',
                value: device === 'device_6' ? 'negative' : 'positive',
            },
        });
    }

    // Some queue votes
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_1', module: 'queue', value: 'short' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_2', module: 'queue', value: 'short' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_3', module: 'queue', value: 'walkin' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_4', module: 'queue', value: 'short' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_5', module: 'queue', value: 'long' } });

    // Packed votes
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_1', module: 'packed', value: 'moderate' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_2', module: 'packed', value: 'packed' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_3', module: 'packed', value: 'moderate' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_4', module: 'packed', value: 'packed' } });
    await prisma.vote.create({ data: { eventId: events[0].id, deviceId: 'device_5', module: 'packed', value: 'moderate' } });

    // Update presence count
    await prisma.event.update({
        where: { id: events[0].id },
        data: { presenceCount: 23 },
    });

    await prisma.event.update({
        where: { id: events[1].id },
        data: { presenceCount: 47 },
    });

    console.log('✓ Added sample votes and presence data\n');

    console.log('🎉 Seed complete!\n');
    console.log('Run `npm run dev` to start the development server.');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
