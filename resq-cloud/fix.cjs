const fs = require('fs');
const files = [
  'src/components/disaster/DisasterCard.tsx',
  'src/components/resources/WarehouseDetailPanel.tsx',
  'src/pages/Inventory.tsx',
  'src/pages/Warehouses.tsx',
  'src/pages/Disasters.tsx',
  'src/pages/ResourceRequests.tsx',
  'src/components/resources/CreateRequestModal.tsx',
  'src/components/ui/PageHeader.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/'FLOOD'/g, "'flood'");
  c = c.replace(/'CYCLONE'/g, "'cyclone'");
  c = c.replace(/'EARTHQUAKE'/g, "'earthquake'");
  c = c.replace(/'HEALTHY'/g, "'healthy'");
  c = c.replace(/'WARNING'/g, "'warning'");
  c = c.replace(/'CRITICAL'/g, "'critical'");
  c = c.replace(/'ACTIVE'/g, "'active'");
  c = c.replace(/'MONITORING'/g, "'monitoring'");
  c = c.replace(/'PENDING'/g, "'pending'");
  c = c.replace(/'APPROVED'/g, "'approved'");
  c = c.replace(/"FLOOD"/g, '"flood"');
  c = c.replace(/"CYCLONE"/g, '"cyclone"');
  c = c.replace(/"EARTHQUAKE"/g, '"earthquake"');
  c = c.replace(/"HEALTHY"/g, '"healthy"');
  c = c.replace(/"WARNING"/g, '"warning"');
  c = c.replace(/"CRITICAL"/g, '"critical"');
  c = c.replace(/"ACTIVE"/g, '"active"');
  c = c.replace(/"MONITORING"/g, '"monitoring"');
  c = c.replace(/"PENDING"/g, '"pending"');
  c = c.replace(/"APPROVED"/g, '"approved"');
  c = c.replace(/setWarehouse\(w\)/g, 'setWarehouse(w || null)');
  c = c.replace(/useState<string\[\]>\(\[\]\)/g, 'useState<any[]>([])');
  c = c.replace(/import \{ ReactNode \}/g, 'import type { ReactNode }');
  c = c.replace(/import \{ Column \}/g, 'import type { Column }');
  fs.writeFileSync(f, c);
});
console.log('Done!');
