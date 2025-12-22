# 🎅 圣诞帽头像生成器

纯前端实现的圣诞帽头像生成工具，使用 MediaPipe Face Mesh 进行人脸检测，自动为头像添加圣诞帽。

## ✨ 特性

- 🔒 **隐私安全**：纯前端处理，图片不会上传到服务器
- 🎯 **精准定位**：使用 MediaPipe Face Mesh 468点人脸关键点检测
- 🎨 **自动适配**：自动计算头部大小、位置和倾斜角度
- 👥 **多人支持**：支持同时为多张人脸添加圣诞帽
- ⚙️ **实时调整**：可调节帽子大小和位置
- 📱 **响应式设计**：支持移动端和桌面端

## 🚀 快速开始

### 方式一：直接打开（推荐）

1. 生成圣诞帽 PNG 图片：
   ```bash
   # 在浏览器中打开 create-hat-png.html
   # 会自动下载 christmas-hat.png
   ```

2. 打开 `index.html` 即可使用

### 方式二：使用本地服务器

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 然后访问 http://localhost:8000
```

## 📖 使用方法

1. 点击"选择头像"按钮上传图片
2. 等待人脸检测完成（通常 1-2 秒）
3. 使用滑块调整帽子大小和位置
4. 点击"下载头像"保存结果

## 🛠️ 技术实现

### 核心技术栈

- **MediaPipe Face Mesh**：468点人脸关键点检测
- **Canvas API**：图像处理和合成
- **原生 JavaScript**：无框架依赖

### 实现原理

```javascript
// 1. 检测人脸关键点
faceMesh.onResults((results) => {
    const landmarks = results.multiFaceLandmarks[0];
    
    // 2. 计算关键位置
    const leftEye = landmarks[33];   // 左眼
    const rightEye = landmarks[263]; // 右眼
    const forehead = landmarks[10];  // 额头中心
    
    // 3. 计算头部倾斜角度
    const angle = Math.atan2(
        rightEye.y - leftEye.y,
        rightEye.x - leftEye.x
    );
    
    // 4. 计算帽子大小和位置
    const faceWidth = Math.abs(rightEye.x - leftEye.x);
    const hatWidth = faceWidth * hatScale;
    const hatY = foreheadY - faceHeight * offsetRatio;
    
    // 5. 旋转并绘制帽子
    ctx.rotate(angle);
    ctx.drawImage(hatImage, x, y, width, height);
});
```

### 关键点说明

| 关键点索引 | 位置 | 用途 |
|-----------|------|------|
| 33 | 左眼外角 | 计算脸宽和倾斜角度 |
| 263 | 右眼外角 | 计算脸宽和倾斜角度 |
| 10 | 额头中心 | 确定帽子垂直位置 |

## 📁 项目结构

```
christmas-hat-master/
├── index.html              # 主页面
├── style.css              # 样式文件
├── app.js                 # 核心逻辑
├── christmas-hat.svg      # 圣诞帽矢量图
├── christmas-hat.png      # 圣诞帽位图（需生成）
├── create-hat-png.html    # PNG 生成工具
└── README.md              # 项目文档
```

## 🎨 自定义帽子

### 替换帽子图片

1. 准备一张透明背景的 PNG 图片
2. 确保帽子顶部在图片上方，底部在下方
3. 替换 `christmas-hat.png` 文件

### 调整默认参数

在 `app.js` 中修改：

```javascript
this.hatScale = 1.5;        // 帽子大小（相对脸宽）
this.hatOffsetRatio = 0.6;  // 垂直偏移（相对脸高）
```

## 🔧 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

需要支持：
- ES6+ JavaScript
- Canvas API
- File API
- WebAssembly（MediaPipe 依赖）

## 📊 性能优化

- MediaPipe 模型从 CDN 加载（约 10MB）
- 首次加载后会被浏览器缓存
- 人脸检测耗时：50-200ms（取决于图片大小）
- 支持最多 5 张人脸同时检测

## 🐛 常见问题

### Q: 未检测到人脸？
A: 确保照片中人脸清晰可见，光线充足，正面或侧面角度不超过 45°

### Q: 帽子位置不准确？
A: 使用滑块调整"垂直位置"参数，或修改代码中的 `hatOffsetRatio`

### Q: 加载很慢？
A: MediaPipe 模型首次加载需要下载约 10MB 文件，请耐心等待

### Q: 想要其他装饰？
A: 替换 `christmas-hat.png` 为任意透明背景的 PNG 图片即可

## 📝 技术方案对比

| 方案 | 优点 | 缺点 | 本项目 |
|------|------|------|--------|
| 仅人脸框检测 | 简单快速 | 无法获取倾斜角度 | ❌ |
| 5点关键点 | 轻量级 | 精度一般 | ❌ |
| **468点 Face Mesh** | **高精度、支持倾斜** | 模型较大 | ✅ |
| 深度学习分割 | 效果最好 | 过于复杂 | ❌ |
| 大模型生成 | 自然融合 | 成本高、不可控 | ❌ |

## 🎯 最优解分析

本项目采用 **MediaPipe Face Mesh + 图像变换** 方案，原因：

1. **精度高**：468 个关键点，准确定位头顶位置
2. **支持倾斜**：自动计算头部角度并旋转帽子
3. **多人支持**：可同时检测多张人脸
4. **纯前端**：无需后端，保护用户隐私
5. **成本低**：免费开源，无 API 调用费用

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，欢迎提交 Issue。
