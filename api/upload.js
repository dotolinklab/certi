import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    form.keepExtensions = true;
    form.maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error uploading file' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileName = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(form.uploadDir, fileName);
      
      fs.rename(file.filepath, newPath, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error saving file' });
        }

        const imageUrl = `/uploads/${fileName}`;
        res.status(200).json({ imageUrl });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
} 