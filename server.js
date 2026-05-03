const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Создаем папки
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(path.join(uploadDir, 'products'))) fs.mkdirSync(path.join(uploadDir, 'products'));

// Настройка хранилища
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext)
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Только изображения!'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Загрузка с оптимизацией
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }
        
        const originalPath = req.file.path;
        const optimizedFilename = `opt_${req.file.filename}`;
        const optimizedPath = path.join('uploads/products', optimizedFilename);
        
        // Оптимизация
        await sharp(originalPath)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toFile(optimizedPath);
        
        // Удаляем оригинал
        fs.unlinkSync(originalPath);
        
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${optimizedFilename}`;
        res.json({ success: true, imageUrl, filename: optimizedFilename });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Ошибка при загрузке файла' });
    }
});

// Удаление
app.delete('/api/upload/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads/products', filename);
    
    fs.unlink(filepath, (err) => {
        if (err) return res.status(404).json({ error: 'Файл не найден' });
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});