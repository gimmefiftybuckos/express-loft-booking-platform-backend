import fs from 'fs';
import path from 'path';
import sharp from '../../node_modules/sharp/lib/index';

const inputDir = './temp';
const outputDir = './uploads';

if (!fs.existsSync(outputDir)) {
   fs.mkdirSync(outputDir, { recursive: true });
}

export const compressImages = async () => {
   const files = fs.readdirSync(inputDir);

   for (const file of files) {
      const inputFilePath = path.join(inputDir, file);
      const outputFilePath = path.join(outputDir, file);

      const extname = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(extname)) {
         try {
            await sharp(inputFilePath)
               .resize({ width: 800 })
               .jpeg({ quality: 70 })
               .toFile(outputFilePath);

            console.log(`Successfully compressed: ${file}`);
         } catch (error) {
            console.error(`Error compressing ${file}:`, error);
         }
      } else {
         console.log(`Skipping non-image file: ${file}`);
      }
   }
};

compressImages();
