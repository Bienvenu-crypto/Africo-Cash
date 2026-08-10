const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/autoComplete="off"/g, 'autoComplete="new-password"');
  newContent = newContent.replace(/<input(?!\s+autoComplete)/g, '<input autoComplete="new-password"');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changed++;
  }
});
console.log(`Updated ${changed} files with autoComplete="new-password"`);
