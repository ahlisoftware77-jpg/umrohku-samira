import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.resolve('public');
const SRC_DIR = path.resolve('src');
const UNUSED_DIR = path.join(PUBLIC_DIR, 'unused_assets');

// Files to completely ignore from being moved (Next.js defaults or standard assets)
const PROTECTED_FILES = new Set([
  'favicon.ico',
  'vercel.svg',
  'next.svg',
  'robots.txt',
]);

// Helper to recursively get all files in a directory
function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // Exclude unused_assets folder itself from scanning
      if (filePath !== UNUSED_DIR) {
        results = results.concat(getFilesRecursively(filePath));
      }
    } else {
      results.push(filePath);
    }
  });
  return results;
}

// Helper to read content of all code files
function getCodeContents(dir: string): string[] {
  const files = getFilesRecursively(dir);
  const contents: string[] = [];
  
  // Also include files in the public directory itself (like JSON config files)
  const publicFiles = getFilesRecursively(PUBLIC_DIR);
  const allFiles = [...files, ...publicFiles];

  allFiles.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (['.tsx', '.ts', '.js', '.jsx', '.json', '.css', '.html'].includes(ext)) {
      try {
        contents.push(fs.readFileSync(file, 'utf-8'));
      } catch (err) {
        // Skip files that can't be read
      }
    }
  });
  return contents;
}

async function main() {
  console.log('Scanning public files...');
  const publicFiles = getFilesRecursively(PUBLIC_DIR);
  
  console.log('Reading codebase contents...');
  const codeContents = getCodeContents(SRC_DIR);

  console.log(`Found ${publicFiles.length} files in public directory.`);
  console.log(`Found ${codeContents.length} code files to check references against.`);

  let movedCount = 0;

  // Make sure destination dir exists
  if (!fs.existsSync(UNUSED_DIR)) {
    fs.mkdirSync(UNUSED_DIR, { recursive: true });
  }

  publicFiles.forEach((filePath) => {
    const relativePath = path.relative(PUBLIC_DIR, filePath);
    const baseName = path.basename(filePath);
    
    // Skip protected files
    if (PROTECTED_FILES.has(baseName) || relativePath.startsWith('unused_assets')) {
      return;
    }

    // Check if the filename or relative path is mentioned in any code file
    let isUsed = false;
    const searchTerms = [
      baseName,
      relativePath.replace(/\\/g, '/'), // forward slash version
      relativePath.replace(/\//g, '\\'), // backward slash version
    ];

    for (const code of codeContents) {
      if (searchTerms.some(term => code.includes(term))) {
        isUsed = true;
        break;
      }
    }

    if (!isUsed) {
      const destPath = path.join(UNUSED_DIR, relativePath);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      console.log(`Moving unused asset: ${relativePath} -> unused_assets/${relativePath}`);
      fs.renameSync(filePath, destPath);
      movedCount++;
    }
  });

  console.log(`\nScan finished. Moved ${movedCount} unused files to public/unused_assets/`);

  // Update .gitignore
  const gitignorePath = path.resolve('.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('/public/unused_assets/')) {
      console.log('Adding /public/unused_assets/ to .gitignore...');
      gitignoreContent += '\n# Unused public assets folder\n/public/unused_assets/\n';
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf-8');
    }
  }
}

main().catch(console.error);
