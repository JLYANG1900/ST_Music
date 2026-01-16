const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 简单的文件上传处理
router.post('/upload', (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // 假设表单字段名为 "file"
        const uploadedFile = req.files.file;
        if (!uploadedFile) {
            return res.status(400).send('Invalid file key. Use "file".');
        }

        // 生成安全的文件名 (保留原扩展名)
        const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const targetPath = path.join(uploadDir, safeName);

        // 移动文件
        uploadedFile.mv(targetPath, (err) => {
            if (err) {
                console.error('[ST_Music] Upload error:', err);
                return res.status(500).send(err);
            }

            // 返回相对 URL
            // SillyTavern 扩展通常映射在 /scripts/extensions/插件名/
            const extensionName = path.basename(__dirname);
            const publicUrl = `/scripts/extensions/${extensionName}/uploads/${safeName}`;

            res.json({
                success: true,
                url: publicUrl,
                name: uploadedFile.name
            });
        });
    } catch (e) {
        console.error('[ST_Music] Server error:', e);
        res.status(500).send(e.toString());
    }
});

module.exports = router;
