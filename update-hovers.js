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
      .replace(/hover:text-gold-400/g, 'hover:text-green-400')
      .replace(/hover:border-gold-400/g, 'hover:border-green-400')
      .replace(/group-hover:text-gold-400/g, 'group-hover:text-green-400')
      .replace(/hover:text-white/g, 'hover:text-green-400')
      .replace(/hover:bg-white\/10/g, 'hover:bg-white/10 hover:border-green-400');
    
    // Some specific cases
    newContent = newContent.replace(/hover:bg-navy-800/g, 'hover:bg-green-500');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
