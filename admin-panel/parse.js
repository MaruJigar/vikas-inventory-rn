const fs = require('fs');
const data = JSON.parse(fs.readFileSync('controllers_dump.json', 'utf8'));
const results = [];

Object.keys(data).forEach(file => {
  const content = data[file];
  const moduleName = file.split('\\\\').slice(-2, -1)[0];
  const controllerRegex = /@Controller\(['"]([^'"]+)['"]\)/g;
  let baseRoute = '';
  const ctrlMatch = controllerRegex.exec(content);
  if (ctrlMatch) baseRoute = ctrlMatch[1];

  const classRolesMatch = content.match(/@Roles\(([^)]+)\)\s*(?:@Controller|export class)/);
  let classRoles = 'ANY';
  if (classRolesMatch) {
      classRoles = classRolesMatch[1].replace(/['"\s]/g, '');
  }

  const methodRegex = /@(Get|Post|Put|Delete|Patch)\((['"][^'"]*['"])?\)/g;
  const methods = [...content.matchAll(methodRegex)];

  methods.forEach(m => {
    const httpMethod = m[1].toUpperCase();
    let route = m[2] ? m[2].replace(/['"]/g, '') : '';
    const endpoint = '/' + baseRoute + (route ? '/' + route : '');
    const idx = m.index;
    const textBefore = content.substring(Math.max(0, idx - 200), idx);
    const roleMatch = textBefore.match(/@Roles\(([^)]+)\)/);
    let roles = classRoles;
    if (roleMatch) {
      roles = roleMatch[1].replace(/['"\s]/g, '');
    } else {
        // Find if there's a @Roles decorator in the exact same method block?
        // textBefore is 200 chars. That should be enough for method decorators.
        if (textBefore.includes('class')) {
            // we went too far back, maybe no roles
        }
    }
    results.push({
      module: moduleName,
      endpoint: endpoint.replace(/\/\/+/g, '/'),
      method: httpMethod,
      roles
    });
  });
});

console.table(results);
fs.writeFileSync('audit_results.json', JSON.stringify(results, null, 2));
