const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('C:\\Users\\HP\\Downloads\\africo-cash\\src', function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/hover:bg-slate-600/g, 'hover:bg-green-500')
      .replace(/hover:bg-blue-600/g, 'hover:bg-green-500')
      .replace(/hover:bg-red-600/g, 'hover:bg-green-500')
      .replace(/hover:border-gold-400\/50/g, 'hover:border-green-400')
      .replace(/text-gold-400 hover:underline/g, 'text-gold-400 hover:text-green-400 hover:underline')
      .replace(/text-gold-400 group-hover:underline/g, 'text-gold-400 group-hover:text-green-400 group-hover:underline');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
