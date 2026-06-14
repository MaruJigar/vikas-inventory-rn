const fs = require('fs');
const data = JSON.parse(fs.readFileSync('services_dump.json', 'utf8'));

const results = [];

for (const [mod, content] of Object.entries(data)) {
    if (content === 'NOT FOUND') {
        results.push({ module: mod, api: 'NOT FOUND', status: 'NOT_READY' });
        continue;
    }

    // Try to find the list method: getProducts, getSalesmen, getShops, etc.
    // We can just look for methods starting with get that don't end with ById or Profile
    const listMethodMatch = content.match(/async\s+get[A-Z][a-zA-Z]+\s*\([^)]*\)\s*\{/g);
    
    // We will do manual regex for the list methods specifically
    const listMethods = {
        product: 'getProducts',
        salesman: 'getSalesmen',
        shop: 'getShops',
        order: 'getOrders',
        visit: 'getVisits',
        inventory: 'getInventory', // actually, it's inside inventory service?
        backorder: 'getBackorders',
        approval: 'getPendingApprovals', // approval service has getPendingApprovals
        notification: 'getNotifications',
        manufacturer: 'getManufacturers',
        distributor: 'getDistributors'
    };

    const targetMethod = listMethods[mod];
    const methodRegex = new RegExp(`async\\s+${targetMethod}\\s*\\(([^)]*)\\)\\s*\\{([\\s\\S]*?)\\n  \\}`);
    const match = content.match(methodRegex);

    let api = 'GET /' + (mod.endsWith('s') ? mod : mod + 's');
    if (mod === 'inventory') api = 'GET /inventory';
    if (mod === 'approval') api = 'GET /approvals/pending';
    if (mod === 'notification') api = 'GET /notifications';

    if (!match) {
        results.push({ module: mod, api, pagination: 'MISSING', search: 'MISSING', filters: 'MISSING', sorting: 'MISSING', ownership: 'MISSING', status: 'NOT_READY' });
        continue;
    }

    const args = match[1];
    const body = match[2];

    const pagination = body.includes('take') || body.includes('skip') || body.includes('limit') ? 'SUPPORTED' : 'MISSING';
    const search = body.includes('Like(') || body.includes('ILIKE') ? 'SUPPORTED' : 'MISSING';
    
    // Ownership check: does it use user_id or role in where clauses?
    let ownership = 'MISSING';
    if (args.includes('role') && body.includes('role ===')) {
        ownership = 'ENFORCED';
    } else if (body.includes('user_id: userId') || body.includes('req.user')) {
        ownership = 'PARTIAL (Self)';
    }
    if (mod === 'manufacturer' || mod === 'distributor') {
        if (body.includes('req.user.role')) ownership = 'ENFORCED';
        else ownership = 'MISSING'; // since my earlier addition didn't fully implement dynamic ownership filtering cleanly
    }

    // Filter check
    const filters = [];
    if (body.includes('status:')) filters.push('status');
    if (body.includes('shop_id:')) filters.push('shop_id');
    if (body.includes('salesman_id:')) filters.push('salesman_id');
    
    // Sort check
    const sorting = body.includes('order:') || body.includes('ORDER BY') ? 'SUPPORTED' : 'MISSING';

    results.push({
        module: mod,
        api,
        pagination,
        search,
        filters: filters.length ? filters.join(', ') : 'MISSING',
        sorting,
        ownership,
        status: pagination === 'MISSING' && search === 'MISSING' && filters.length === 0 ? 'NOT_READY' : (pagination === 'SUPPORTED' && ownership === 'ENFORCED' ? 'READY' : 'PARTIALLY_READY')
    });
}

console.table(results);
fs.writeFileSync('audit_results2.json', JSON.stringify(results, null, 2));
