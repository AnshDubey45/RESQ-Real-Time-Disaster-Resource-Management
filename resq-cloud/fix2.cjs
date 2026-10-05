const fs = require('fs');
let f = 'src/components/resources/CreateRequestModal.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/'MEDIUM'/g, "'medium'");
c = c.replace(/"HIGH"/g, '"high"');
c = c.replace(/"MEDIUM"/g, '"medium"');
c = c.replace(/"LOW"/g, '"low"');
fs.writeFileSync(f, c);
console.log('Fixed CreateRequestModal');
