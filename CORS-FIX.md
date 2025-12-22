# CORS 跨域问题解决方案

## 问题描述
PNG 帽子图片（`hat.png` 和 `hat1.png`）因为 CORS 跨域策略无法加载。
错误信息：`No 'Access-Control-Allow-Origin' header is present on the requested resource`

## 当前状态
✅ 应用已有 fallback 机制，PNG 加载失败时会自动使用 Canvas 生成备用帽子
✅ 功能不受影响，但 PNG 帽子样式无法显示

## 解决方案

### 方案 1：服务器配置（推荐）

#### Apache (.htaccess)
```apache
<IfModule mod_headers.c>
    <FilesMatch "\.(png|jpg|jpeg|gif|svg)$">
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>
```

#### Nginx
```nginx
location ~* \.(png|jpg|jpeg|gif|svg)$ {
    add_header Access-Control-Allow-Origin *;
}
```

#### Node.js/Express
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
```

### 方案 2：使用相对路径（当前已使用）
代码中已经使用相对路径 `img.src = hatFile;`，确保文件在同一域名下。

### 方案 3：将 PNG 转为 Data URL（备选）
如果无法修改服务器配置，可以将 PNG 文件内嵌到 JavaScript 中。

## 检查清单

1. ✅ 确认 `hat.png` 和 `hat1.png` 文件存在于项目根目录
2. ✅ 确认文件大小正常（hat.png: 9.7KB, hat1.png: 32KB）
3. ⚠️ 检查服务器是否有 CORS 配置
4. ⚠️ 确认文件没有被重定向到其他域名

## 当前 Fallback 机制
当 PNG 加载失败时，`createFallbackHat()` 会自动生成一个红色圣诞帽：
- 红色三角形主体 (#DC143C)
- 白色边缘装饰
- 白色顶部球球

## 建议
联系服务器管理员添加 CORS 头，或确保图片文件与 HTML 在同一域名下不被重定向。
