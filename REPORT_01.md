# TASK_01 · Longbing 工作台安卓化前序摸底与环境体检

盘点日期：2026-11-25。范围为 HTML 静态检查和 Windows 本机只读检查。本阶段未打包、未做 Android 真机试验。

## 1. 文件与目录

| 检查项 | 结果 |
| --- | --- |
| 项目根目录 | `C:\Users\26020\Documents\Codex\2026-11-25\ni` |
| 实际盘点文件 | `C:\Users\26020\Desktop\Longbing-optimized.html`。根目录递归扫描未发现 HTML，桌面同名系列只找到用户指定的这一份。 |
| 文件大小与行数 | 1,220,402 字节（约 1.16 MiB），532 行。 |
| 最后修改时间 | 文件系统显示 `2026-11-22 17:36:14`。 |
| 根目录结构 | 盘点前仅有 `outputs/` 和 `work/` 两个空子目录。未发现 `package.json`、`android/` 或其他项目源码。 |
| 文件形态 | React + Vite 构建后的单文件产物。内联模块从第 9 行开始，在第 526 行结束，内联样式在第 527 行。许多功能被压缩到同一行。 |
| 原件 SHA-256 | `85A1DBBB773F75EC00EE465005B8B1B27E80D8D73A733388ED69F9AA1BA623E9` |

GitHub 只读交叉核对：公开仓库 `main` 的最新提交为 `2bd7b26`（将 `Longbing.html` 重命名为 `index.html`），仓库根目录只列出 `README.md` 和 `index.html`，没有 `package.json` 或 `android/`。仓库的 `index.html` 显示 532 行、1.16 MB。其 Raw 页面与桌面原件的文本长度、行数、末尾换行及两种独立计算的 32 位文本校验值一致（`ea97c5a0`、`621de624`）。本次以桌面原件作为静态盘点依据。[仓库快照](https://github.com/fengchuanxiangzi787-tech/longbinggongzuotai/tree/2bd7b26167cda12a86ce0df335e5755396c9e342)、[仓库 HTML](https://github.com/fengchuanxiangzi787-tech/longbinggongzuotai/blob/2bd7b26167cda12a86ce0df335e5755396c9e342/index.html)。

以下行号均指桌面原件。对集中在同一行的调用点，用函数名、功能名或关键字区分。

## 2. 外部 CDN 与离线边界

| 资源类别 | 发现与位置 |
| --- | --- |
| 外部脚本、样式、预加载或图标 | **0 项。** 第 9 行唯一的 `<script type="module" crossorigin>` 没有 `src`。第 527 行是内联 `<style>`。没有实际的 `<link href>` 或模块预加载链接。第 9 行的 Vite 预加载补丁只会对发现的 `modulepreload` 链接执行 `fetch`。 |
| 外部字体 | **0 项。** 未发现 `@font-face`、CSS `@import` 或字体 URL。第 482、527 行声明本机字体与系统回退字体，例如 `Inter`、`Microsoft YaHei`、`PingFang SC`、`system-ui`。 |
| 外部图片 | **0 项。** 第 478 行有 10 个内嵌 WebP Data URL，页面图标以 SVG 路径随脚本内联。图片的其他来源为本地文件、图片预览或本地存储。未发现 CSS `url()` 或远程图片资源。 |

页面资源没有发现需要下载到本地的 CDN 项。静态检查显示手动录入、绩点与实验统计、记账和本地日程不依赖 CDN。以下交互涉及网络：

| 交互或字符串 | 发现与位置 |
| --- | --- |
| 远程 AI 请求 | 第 403、470 行。用户配置 Base URL、API Key、模型后，代码向 Base URL 拼接的 `/chat/completions` 发出 `fetch` POST。此路径用于 AI 对话、连接测试和成绩单、实验记录、小票、校园通知等图片识别。 |
| AI 接口预设 | 第 470 行。OpenAI `https://api.openai.com/v1`、阿里百炼 `https://dashscope.aliyuncs.com/compatible-mode/v1`、Gemini `https://generativelanguage.googleapis.com/v1beta/openai`、智谱 `https://open.bigmodel.cn/api/paas/v4`、DeepSeek `https://api.deepseek.com`。代码还允许填写自定义 Base URL。 |
| 默认书签及自定义网址 | 第 470 行。默认书签为 `https://www.cau.edu.cn`、`https://jwc.cau.edu.cn`、`https://www.cnki.net`、`https://scholar.google.com`、`https://github.com`。点击书签打开网址。 |
| 库内的 URL 字符串 | 第 41 行的 `https://reactjs.org/docs/error-decoder.html?invariant=` 属于 React 错误信息；第 41、45、48、58 行的 `www.w3.org` URL 用于 SVG、XML、MathML 或 XHTML 命名空间。这些字符串不触发资源加载。 |

## 3. 存储键与数据迁移

共发现 **11 个 `localStorage` 键**，其中 2 个用于旧版图片迁移，以及 **1 个 `sessionStorage` 键**。

| 存储 | 键名 | 用途与值格式 | 位置 |
| --- | --- | --- | --- |
| `localStorage` | `labsnap-api-v1` | 全局 AI 接口配置，JSON 对象 `{baseUrl, apiKey, model}`。 | 403、470 |
| `localStorage` | `longbing.gpa.v1` | 绩点规则、目标及课程成绩。JSON 对象包含 `ruleId`、`customTiers`、`targetGpa`、`courses`、`activeDemoId`。 | 477、526 |
| `localStorage` | `longbing.lab.v1` | 实验数据集及图表轴选择，JSON 对象包含 `dataset`、`xCol`、`yCol`。 | 477、482、486 |
| `localStorage` | `jizhang.records.v1` | 收支流水，JSON 数组。金额字段为 `amountCents`，单位为分，另含类型、日期、分类、备注等。 | 477、488 |
| `localStorage` | `snapcal_agent_existing_v1` | 校园日程，JSON 数组。记录包含 `id`、`title`、`date`、`startTime`、`endTime`、`location`、`tag` 等。绩点模块也可写入期末考试安排。 | 477、489–490 |
| `localStorage` | `longbing.bookmarks.v1` | 常用网址，JSON 数组，元素包含 `id`、`title`、`url`、`group`。 | 470、477 |
| `localStorage` | `longbing.theme.v1` | 明暗主题，字符串 `light` 或 `dark`。 | 526 |
| `localStorage` | `longbing.ui-skin.v1` | UI 皮肤，字符串 `default`、`ui1` 或 `ui2`。 | 526 |
| `localStorage` | `longbing.home-ui-opacity.v1` | 首页界面透明度，保存为十进制整数字符串，读取范围 20–100。 | 478 |
| `localStorage` | `longbing.home-cover.v1` | 旧版首页头图 Data URL。读到后尝试迁移到 IndexedDB，成功后删除旧键。 | 470、478 |
| `localStorage` | `longbing.home-background.v1` | 旧版首页背景图 Data URL，迁移方式同头图。 | 470、478 |
| `sessionStorage` | `longbing.extractions.v1` | 当前会话的 AI 图片提取结果缓存，JSON 数组，最多 16 条 `{key, text}`。键基于任务、端点、模型和图片等内容计算。 | 404、411–436 |

- 当前首页照片写入 IndexedDB 的 `longbing-media-v1`（版本 1），对象仓库 `images`，记录键为 `home-cover`、`home-bg`，值为压缩后的图片 Data URL。相关逻辑在第 470、478 行。
- 第 470 行的备份读写限制在 `fu` 白名单内，共 8 个业务及外观键，格式为 `{schema: "longbing-backup-v1", exportedAt, data}`，`data` 的值保留为原始字符串。备份不包含 AI 配置、首页图片（含旧键）或会话缓存；逐项检查 `localStorage.key()` 的代码仅用于估算容量。
- 桌面浏览器与 Android App 的 WebView 使用各自的存储。现有 JSON 备份可作为这 8 个键的迁移入口。后续应保留键名、值类型和备份格式，并单独处理首页图片与 AI 配置的迁移。

## 4. Android WebView 高风险调用

| 类型 | 模块与调用点 | 后续验证重点 |
| --- | --- | --- |
| 下载 | 第 470 行 `Z1` 全站 JSON 备份；第 488 行实验数据 CSV；第 489 行记账 CSV；第 490 行日程 ICS。共 4 处，均通过 `new Blob`、`URL.createObjectURL`、动态 `<a>` 的 `.download` 与 `.click()` 触发，随后撤销对象 URL。 | 验证文件是否实际写出、保存路径、MIME 类型和系统分享或打开行为。当前提示在点击链接后即显示成功。 |
| 图片对象 URL | 第 470 行 `Mr` 使用 `URL.createObjectURL`、`Image.decode()` 与 Canvas 压缩选中的文件，最后撤销对象 URL。 | 这是导入预处理。验证安卓图片选择器交付的文件可解码。 |
| 剪贴板 | 第 487 行实验模块“复制三线表”：用 `ClipboardItem` 和两个 `Blob` 组装 HTML 及纯文本，调用 `navigator.clipboard.write`，回退到 `writeText`。未发现 `document.execCommand`。 | 验证 WebView 的剪贴板可用性、纯文本回退和富文本在目标应用中的粘贴结果。 |
| 文档选择 | 第 470 行备份恢复：隐藏 `input type="file"`，接受 `application/json,.json`，通过 `File.text()` 读取。 | 验证文件选择器、取消操作和 JSON 文件回传。 |
| 图库和拍照 | 第 478 行首页设置有头图、背景图两个图片输入；第 488 行实验记录；第 489 行记账票据；第 490 行日程截图；第 526 行成绩单图库及独立拍照输入。以上共 7 个 `accept="image/*"`；仅成绩单的拍照入口设置 `capture="environment"`。加上 JSON 共 8 个文件输入。未发现 `getUserMedia`。 | 分别验证图库、拍照、取消及文件回传，尤其是独立的后置相机入口。 |
| 弹窗 | 第 490 行绩点保分“清空”成绩表调用 `window.confirm`，确认后才清空；未发现 `alert` 或 `prompt` 调用。另有第 470 行共用的原生 `<dialog>` / `showModal()`，第 482 行 AI 助手使用 `role="dialog"` 的自建弹层。 | 验证确认与取消都能正确执行，并检查全屏或键盘弹出时的对话框行为。 |
| 外链跳转 | 第 470 行常用网址使用动态 `href`、`target="_blank"`、`rel="noopener noreferrer"`。未发现 `window.open`。 | 验证系统浏览器打开链接，以及返回后工作台状态是否保留。 |

## 5. 移动端布局

- **顶部导航。** 第 526 行 `header.lb-topbar` 内的 `<nav>` 放置首页和各模块按钮，外层与导航都使用 `flex-wrap`，窄屏可换行。第 527 行 `.lb-topbar` 使用 `position: sticky; top: 0`。页面没有全局侧边栏或底部标签栏。
- **响应式断点。** 第 527 行有 `min-width` 为 `640px`、`768px`、`1024px`、`1280px` 的规则，另有 `prefers-reduced-motion: reduce`。栏宽、网格列数和部分按钮文字随宽度变化。第 490 行成绩明细表有横向滚动容器，表格最小宽度为 `780px`。
- **Viewport。** 第 5 行是 `width=device-width, initial-scale=1.0`。本文件未声明 `viewport-fit=cover`，也未发现 `env(safe-area-inset-*)`。

## 6. Windows 安卓打包环境

| 检查项 | 检测结果 |
| --- | --- |
| `node -v` | `v24.22.1`。 |
| `npm -v` | `11.19.1`。 |
| `pnpm -v` | `11.25.0`，当前终端可调用的命令来自 Codex 随附运行时。 |
| `java -version`、`javac` | 当前终端均找不到命令，`JAVA_HOME`、`JDK_HOME` 未设置。常见路径未发现可用的 JDK 17 或 21。另用绝对路径确认 IBM SPSS 随附 OpenJDK JRE `1.8.0_252`，其目录没有 `javac.exe`，无法用于本项目打包。 |
| `ANDROID_HOME` | 进程、用户和系统均未配置，无对应路径。 |
| `ANDROID_SDK_ROOT` | 进程、用户和系统均未配置，无对应路径。 |
| Android Studio | 在 `C:\Program Files\Android\Android Studio`、用户安装目录、Toolbox 等常见位置及可读卸载记录中未发现。 |
| Android SDK | 未找到 `C:\Users\26020\AppData\Local\Android\Sdk` 或检查过的其他常见 SDK 路径。未发现可供当前项目使用的 SDK Platforms 和 Build Tools。 |
| `adb version` | 当前终端找不到 `adb`，无法获取版本；常见 SDK 路径未发现 `platform-tools\adb.exe`。 |
| `HTTP_PROXY` / `HTTPS_PROXY` | 当前进程未配置这两个变量，用户和系统级也未设置。仅检查这两个环境变量。 |

检查覆盖当前终端、常用安装路径和可读注册表项。部分用户级 Java 注册表项受权限限制，因此结果不排除自定义目录中存在未配置的工具。

Capacitor 6 的升级指南使用 Android Gradle Plugin 8.2.1，AGP 8.2 的最低及默认 JDK 都是 17。Capacitor 7 要求 JDK 21 与 Android Studio Ladybug（2024.2.1）或更新版本。当前需补齐适配目标版本的 JDK、Android SDK（含 Platform、Build Tools 和 Platform-Tools），并为构建或调试流程配置工具路径。Android Studio 路线下可使用随附的 JDK。[Capacitor 6 升级文档](https://capacitorjs.com/docs/v6/updating/6-0)、[Android Gradle Plugin 8.2 兼容性](https://developer.android.com/build/releases/agp-8-2-0-release-notes)、[Capacitor 7 升级文档](https://capacitorjs.com/docs/v7/updating/7-0)。

本阶段只新增根目录报告。HTML 原件的哈希在检查后复核，未安装软件、未修改环境变量。
