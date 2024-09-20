import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

enum Dir {
   INPUT = './temp',
   OUTPUT = './uploads',
}

if (!fs.existsSync(Dir.OUTPUT)) {
   fs.mkdirSync(Dir.OUTPUT, { recursive: true });
}

export const compressImages = async () => {
   const files = fs.readdirSync(Dir.INPUT);

   for (const file of files) {
      const inputFilePath = path.join(Dir.INPUT, file);
      const outputFilePath = path.join(Dir.OUTPUT, file);

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
