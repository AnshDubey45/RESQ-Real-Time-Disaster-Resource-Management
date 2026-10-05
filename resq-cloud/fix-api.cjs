const fs = require('fs');
let f = 'src/services/api.ts';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /async createResourceRequest\(data: any\): Promise<ResourceRequest> \{[\s\S]*?\},/,
  \sync createResourceRequest(data: any): Promise<ResourceRequest> {
    await delay(400);
    const newReq = { ...mockRequests[0], ...data, id: 'REQ-' + Date.now(), status: 'pending' };
    mockRequests.unshift(newReq);
    return newReq;
  },\
);

fs.writeFileSync(f, c);
console.log('Fixed api.ts');
