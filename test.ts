

import { discoverSuppliers } from './lib/server/supplier-discovery.ts';
import { parseIntent } from './lib/server/intent-compiler.ts';

async function run() {
  console.log("Starting test...");
  const rawInput = "Find PT100 RTD temperature sensors from manufacturers or authorized distributors in India, required range -50°C to 200°C, and compare products that actually satisfy the requirement.";
  
  console.log("Parsing intent...");
  const intent = await parseIntent(rawInput);
  console.log("Intent:", JSON.stringify(intent, null, 2));

  console.log("Discovering suppliers...");
  const result = await discoverSuppliers(intent);
  
  console.log(`Found ${result.suppliers.length} suppliers.`);
  for (const s of result.suppliers) {
    console.log(`\nSupplier: ${s.name.value}`);
    console.log(`Type: ${s.supplierType.value}`);
    console.log(`URL: ${s.website.value}`);
    console.log(`Products: ${s.products.value?.join(', ')}`);
    console.log(`Sources: ${s.sourceCount}`);
    console.log(`Confidence: ${s.dataConfidence}%`);
    if (s.listings.length > 0) {
      console.log(`First product: ${s.listings[0].productName.value}`);
      console.log(`First price: ${s.listings[0].price?.value} ${s.listings[0].currency?.value}`);
    }
  }
}

run().catch(console.error);
