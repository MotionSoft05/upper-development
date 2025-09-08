/**
 * Migration Script: FlightScreens Data Structure Fix
 * 
 * PURPOSE: Migrate data from obsolete flightScreens/{companyId} structure
 * to the standard pattern used by all other modules (promociones, directorio, etc.)
 * 
 * WHAT IT DOES:
 * 1. Reads existing data from flightScreens collection
 * 2. Migrates screen names to usuarios.nombrePantallasVuelos
 * 3. Migrates configurations to TemplateVuelos collection
 * 4. Provides option to cleanup old flightScreens collection
 * 
 * RUN WITH: node scripts/migrate-flight-screens.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (adjust path if needed)
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrateFlightScreensData() {
  console.log('🚀 Starting Flight Screens Data Migration...');
  
  try {
    // Step 1: Get all documents from flightScreens collection
    console.log('📋 Reading existing flightScreens data...');
    const flightScreensSnapshot = await db.collection('flightScreens').get();
    
    if (flightScreensSnapshot.empty) {
      console.log('✅ No data found in flightScreens collection. Migration not needed.');
      return;
    }
    
    const migrations = [];
    
    // Process each company's flight screen data
    for (const doc of flightScreensSnapshot.docs) {
      const companyId = doc.id;  // This is the empresa name
      const data = doc.data();
      
      console.log(`\n🔄 Processing company: ${companyId}`);
      
      // Step 2: Find usuarios for this company
      const usuariosQuery = db.collection('usuarios').where('empresa', '==', companyId);
      const usuariosSnapshot = await usuariosQuery.get();
      
      if (usuariosSnapshot.empty) {
        console.log(`⚠️  No users found for company ${companyId}, skipping...`);
        continue;
      }
      
      // Step 3: Migrate screen names to usuarios.nombrePantallasVuelos
      const screenNames = data.screenNames || [];
      console.log(`   📝 Found ${screenNames.length} screen names to migrate`);
      
      const usuariosUpdatePromises = [];
      usuariosSnapshot.forEach((usuarioDoc) => {
        const nombrePantallasObject = {};
        screenNames.forEach((nombre, index) => {
          nombrePantallasObject[`nombrePantallasVuelos.${index}`] = nombre;
        });
        
        usuariosUpdatePromises.push(
          usuarioDoc.ref.update(nombrePantallasObject)
        );
      });
      
      await Promise.all(usuariosUpdatePromises);
      console.log(`   ✅ Updated ${usuariosSnapshot.size} user records with screen names`);
      
      // Step 4: Check if TemplateVuelos already exists for this company
      const templateVuelosQuery = db.collection('TemplateVuelos').where('empresa', '==', companyId);
      const templateVuelosSnapshot = await templateVuelosQuery.get();
      
      // Step 5: Migrate configuration to TemplateVuelos
      const templateData = {
        empresa: companyId,
        idioma: data.language || 'es',
        pantallasConfig: data.screenSettings || {},
        dynamicMessages: data.dynamicMessages || [],
        distanceConfig: data.distanceConfig || { enabled: false },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'migration-script',
        // Keep original data for reference
        _migratedFrom: 'flightScreens',
        _originalData: {
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy
        }
      };
      
      if (!templateVuelosSnapshot.empty) {
        // Update existing document
        const existingDoc = templateVuelosSnapshot.docs[0];
        await existingDoc.ref.update(templateData);
        console.log(`   ✅ Updated existing TemplateVuelos document`);
      } else {
        // Create new document
        await db.collection('TemplateVuelos').add(templateData);
        console.log(`   ✅ Created new TemplateVuelos document`);
      }
      
      migrations.push({
        company: companyId,
        screenNames: screenNames.length,
        usersUpdated: usuariosSnapshot.size,
        configMigrated: true
      });
    }
    
    // Summary
    console.log('\n📊 Migration Summary:');
    console.log('====================');
    migrations.forEach(migration => {
      console.log(`🏢 ${migration.company}:`);
      console.log(`   - Screen names: ${migration.screenNames}`);
      console.log(`   - Users updated: ${migration.usersUpdated}`);
      console.log(`   - Config migrated: ${migration.configMigrated ? '✅' : '❌'}`);
    });
    
    console.log(`\n✅ Migration completed successfully for ${migrations.length} companies!`);
    
    // Optional cleanup prompt
    console.log('\n🧹 CLEANUP OPTION:');
    console.log('The old flightScreens collection data is still available.');
    console.log('To remove it after verifying migration success, run:');
    console.log('node scripts/migrate-flight-screens.js --cleanup');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function cleanupOldData() {
  console.log('🧹 Starting cleanup of old flightScreens collection...');
  
  try {
    const flightScreensSnapshot = await db.collection('flightScreens').get();
    
    if (flightScreensSnapshot.empty) {
      console.log('✅ flightScreens collection is already empty.');
      return;
    }
    
    const batch = db.batch();
    flightScreensSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${flightScreensSnapshot.size} documents from flightScreens collection`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupOldData();
  } else {
    migrateFlightScreensData();
  }
}

module.exports = { migrateFlightScreensData, cleanupOldData };