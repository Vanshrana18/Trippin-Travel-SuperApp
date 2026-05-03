const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix motion import
    content = content.replace(/import\s+\{\s*motion\s*\}\s+from\s+['"]framer-motion['"];?\s*\n?/g, '');
    content = content.replace(/import\s+\{\s*motion,\s*AnimatePresence\s*\}\s+from\s+['"]framer-motion['"];?\s*\n?/g, "import { AnimatePresence } from 'framer-motion';\n");
    content = content.replace(/import\s+\{\s*AnimatePresence,\s*motion\s*\}\s+from\s+['"]framer-motion['"];?\s*\n?/g, "import { AnimatePresence } from 'framer-motion';\n");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
