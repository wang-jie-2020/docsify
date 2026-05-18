## next 打包

执行 `next build` 时，Next.js 会做三件事：

1. 编译 — SWC/Babel 转译 TS/JSX → JS
2. 代码分割 — 按路由自动拆分（每个 `page` 一个 chunk），`dynamic import` 的组件单独成 chunk
3. 优化 — CSS/JS minify、tree shaking、图片优化

### 打包输出目录

默认输出到 `.next/` 目录，核心结构：

```
.next/
├── static/          # 静态资源 (_next/static/...)
│   ├── chunks/      # JS chunks
│   ├── css/         # CSS 文件
│   └── media/       # 图片等
├── server/          # 服务端使用的文件（SSR/RSC/API routes）
├── cache/           # 构建缓存
└── BUILD_ID         # 部署标识
```

通过 `next.config.js` 的 `distDir` 可自定义输出目录。

### 部署/分发方式

1. Node.js 服务器（最常用，支持 ISR/SSR 全功能）

```bash
next build && next start -p 3000
```

部署产物只需要：`.next/` + `public/` + `package.json` + `node_modules/`（或 lockfile → `npm ci --production`）

2. 静态导出（纯静态站，无 SSR/ISR）

```bash
# next.config.js 中配置 output: 'export'next build  # 产物在 out/ 目录
```

产物直接丢到 Nginx / S3 / CDN。

3. Docker 容器 用 multi-stage build，只拷贝 `.next/standalone/`（需配置 `output: 'standalone'`）+ `static/` + `public/`，镜像体积最小。

4. Vercel / Netlify — 零配置，推代码自动部署。

   

简单说：Node 服务用 `.next/` + `next start`，纯静态用 `output: 'export'` → `out/`，容器用 `standalone` 模式。