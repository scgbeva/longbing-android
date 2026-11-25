# TASK_02 · Longbing 工作台安卓工程化交付

交付日期：2026-11-25。已在当前目录建立 Vite + Capacitor Android 工程，并通过前端构建和 Android 同步。未运行 Gradle 或编译 APK。

## 工程与原件

| 路径 | 内容 |
| --- | --- |
| `legacy/Longbing-optimized.html` | 桌面原件的逐字节备份，原件和备份的 SHA-256 均为 `85A1DBBB773F75EC00EE465005B8B1B27E80D8D73A733388ED69F9AA1BA623E9`。 |
| `index.html`、`src/main.js` | Vite 页面及模块入口。 |
| `src/workbench.js`、`src/workbench.css`、`src/assets/` | 保留原工作台的 React 运行时代码、模块及样式。10 张原内嵌 WebP 图片按原字节拆为本地静态资源。 |
| `src/nativeBridge.js`、`src/chartPng.js`、`src/mobile.css` | 原生桥接、拟合图 PNG 生成和窄屏样式。 |
| `package.json`、`pnpm-lock.yaml`、`capacitor.config.json` | Vite `7.3.8`、Capacitor Core / CLI / Android `7.6.10` 和六个官方插件。应用 ID 为 `com.longbing.workbench`，应用名为 `Longbing 工作台`，`webDir` 为 `dist`。 |
| `dist/`、`android/` | 前端产物、Capacitor 生成的安卓工程和同步后的资源。安卓 Manifest 保留 `INTERNET`，新增 `android:usesCleartextTraffic="true"`；Capacitor 配置启用 `android.allowMixedContent`。 |

六个原有业务模块及 AI 浮窗均保留。11 个 `localStorage` 键、1 个 `sessionStorage` 键，以及 IndexedDB 的首页图片和原有 JSON 备份格式均沿用。核对了绩点规则、保分反推、实验拟合、三线表和 ICS 的关键源码，计算与序列化逻辑未改。

## 桥接与移动布局

| 调用点 | Android | Web |
| --- | --- | --- |
| JSON 备份、实验 CSV、记账 CSV、日程 ICS、拟合图 PNG | `Filesystem` 写入 `Directory.Cache`，调用 `Share` 分享缓存文件。 | `Blob` 及浏览器下载。拟合图 PNG 从同一个 SVG 渲染生成。 |
| 三线表、AI 回复复制 | `Clipboard` 写入纯文本。三线表保留制表符，并提示可在 Word / WPS 中转为表格。 | 三线表优先使用 HTML 剪贴板，失败时退回纯文本。AI 回复使用文本剪贴板。 |
| 校园与学术书签 | `Browser` 在系统浏览器标签页打开 HTTP(S) 链接。 | 保留新标签页跳转。 |
| 物理键或手势返回 | `App.backButton` 依次处理顶层弹窗、AI 浮窗、模块返回首页。在首页两秒内再按一次退出，首次显示轻提示。 | 沿用网页原有关闭和导航交互。 |
| 状态栏 | `StatusBar` 在启动、明暗切换和相关皮肤切换时更新。针对本工程的 API 35 目标启用非重叠状态栏主题，并保留 Capacitor 的边到边间距处理。 | 沿用网页主题。 |

- `viewport-fit=cover` 配合顶部、底部和横向安全区。`768px` 及以下显示可横向滑动的底部导航，触控高度至少 `44px`；宽屏沿用原顶部导航。
- 窄屏表单控件的字号至少 `16px`。实验表和成绩表在各自容器内横向滚动。AI 启动按钮有独立空间，内容区在按钮上方结束，导出按钮和底部 Tab 不会被它盖住。
- 保留原有 JSON 导入、图库与成绩单拍照入口，由 Capacitor WebView 的文件选择器处理。

## 验收

| 检查 | 实际结果 |
| --- | --- |
| `pnpm install` | 成功。依赖和锁文件已就位，工作区放行了 Vite 所需的 `esbuild` 安装脚本。 |
| `npx cap add android` | 成功，已生成 `android/`。 |
| `pnpm run build` | 成功，构建 38 个模块；最终构建无警告、无报错。 |
| `npx cap sync android` | 成功，识别六个官方插件；核对了 17 个已复制前端文件与 `dist` 字节一致。 |
| 浏览器检查 | 桌面六个模块均可打开；实际验证了 Web 三线表富文本复制和 PNG 下载。`390 × 844` 下实测 Tab 高度 `44px`、表单字号 `16px`，实验表及成绩表各自横向滚动，AI 按钮位于内容和底栏之间。已验证主题切换与 AI 浮窗打开。 |
| 桥接模拟检查 | 验证了 Web 降级、Android 缓存路径及文件内容、分享 URI、复制、外链、状态栏样式参数和返回处理顺序。 |

尚未做 Android 真机验证。分享面板能否直接保存或导入 `.ics` 取决于设备安装的接收应用；状态栏、手势返回、文件选择和照片入口也需真机确认。远程 AI 接口仍受服务端跨域规则约束。
