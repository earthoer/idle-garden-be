import * as dotenv from 'dotenv';
import { connect, connection } from 'mongoose';
import { seedsData } from './data/seeds.data';
import { locationsData } from './data/locations.data';

// Load environment variables
dotenv.config();

async function syncCollection(
  collectionName: string,
  dataArray: any[],
  uniqueField: string = 'code'
) {
  const db = connection.db;
  const collection = db.collection(collectionName);

  let inserted = 0;
  let updated = 0;
  let deleted = 0;

  // 1. Upsert (Insert or Update)
  for (const item of dataArray) {
    const filter = { [uniqueField]: item[uniqueField] };
    const result = await collection.updateOne(
      filter,
      { $set: item },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  // 2. Delete items not in seed data
  const seedCodes = dataArray.map(item => item[uniqueField]);
  const deleteResult = await collection.deleteMany({
    [uniqueField]: { $nin: seedCodes }
  });
  deleted = deleteResult.deletedCount;

  return { inserted, updated, deleted };
}

async function seed() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/idle-garden';
    console.log('🔌 Connecting to MongoDB...');
    await connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Sync seeds
    console.log('🌱 Syncing seeds...');
    const seedsResult = await syncCollection('seeds', seedsData, 'code');
    console.log(`   ✅ ${seedsResult.inserted} inserted`);
    console.log(`   🔄 ${seedsResult.updated} updated`);
    console.log(`   🗑️  ${seedsResult.deleted} deleted`);

    // Sync locations
    console.log('\n📍 Syncing locations...');
    const locationsResult = await syncCollection('locations', locationsData, 'code');
    console.log(`   ✅ ${locationsResult.inserted} inserted`);
    console.log(`   🔄 ${locationsResult.updated} updated`);
    console.log(`   🗑️  ${locationsResult.deleted} deleted`);

    // Display summary
    console.log('\n📊 Seed Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Seeds:`);
    console.log(`  • Inserted: ${seedsResult.inserted}`);
    console.log(`  • Updated:  ${seedsResult.updated}`);
    console.log(`  • Deleted:  ${seedsResult.deleted}`);
    console.log(`Locations:`);
    console.log(`  • Inserted: ${locationsResult.inserted}`);
    console.log(`  • Updated:  ${locationsResult.updated}`);
    console.log(`  • Deleted:  ${locationsResult.deleted}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ Seed completed successfully!');
    console.log('🌳 Your Idle Garden database is synced.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
