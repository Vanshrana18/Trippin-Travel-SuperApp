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
    
    // Check if motion is used but not imported
    if (content.includes('<motion') && !content.includes('import { motion') && !content.includes('import { AnimatePresence, motion') && !content.includes("import {motion")) {
      // If it has AnimatePresence import from framer-motion, replace it
      if (content.includes("import { AnimatePresence } from 'framer-motion';")) {
        content = content.replace("import { AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';");
      } else {
        // Find the last import statement or put at the top
        const lastImportIndex = content.lastIndexOf('import ');
        if (lastImportIndex !== -1) {
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine + 1) + "import { motion } from 'framer-motion';\n" + content.slice(endOfLine + 1);
        } else {
            content = "import { motion } from 'framer-motion';\n" + content;
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Restored motion to', filePath);
    }
  }
});
