# TASK_03 · Longbing 图标、安卓权限与 APK 打包流水线

2026-11-25。本地已完成品牌资源、安卓配置和 GitHub Actions 工作流。当前目录没有 Git 工作树，未初始化仓库、提交或推送。APK 将由 GitHub Actions 生成。

## 图标与启动页

- `resources/icon.png` 为 `1024 × 1024`，采用深蓝底与青绿翻页图形，无文字。`resources/splash.png` 为 `2732 × 2732`，在深蓝底中央显示同一图形。
- `scripts/generate-android-branding.py` 使用 Pillow 生成母图和安卓资源。已替换 `mdpi` 至 `xxxhdpi` 的普通、圆形及 Adaptive Icon 前景，共 15 张图标，并更新自适应图标背景色。另替换 11 张默认及横竖屏启动图。
- `values/styles.xml` 和 `values-v35/styles.xml` 已设置品牌启动背景与图标。检查了 PNG 尺寸、透明角、最小密度下的可读性及 Adaptive Icon 的 `66dp` 安全区。Android 12 及以上的冷启动由系统展示配置的图标和背景。[Android Adaptive Icon](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)、[系统启动屏](https://developer.android.com/develop/ui/views/launch/splash-screen)。

## Manifest、FileProvider 与版本

- 保留 `android.permission.INTERNET` 与 `android:usesCleartextTraffic="true"`。相机硬件声明为可选 `android:required="false"`，并用 `IMAGE_CAPTURE` 查询声明配合 Capacitor 对系统相机的 `resolveActivity` 检测。相册/文件选择由系统处理，原有专用拍照入口调用系统相机。未新增直接相机权限。[Android 软件包可见性](https://developer.android.com/training/package-visibility/declaring)。
- FileProvider 使用 `${applicationId}.fileprovider`，设置 `exported="false"`、`grantUriPermissions="true"`，引用 `@xml/file_paths`。内部缓存覆盖 `.ics`、两个 `.csv`、`.json` 和 PNG 的 `cache/exports/`，Share 将文件映射为 `content://` URI 后授予读取权限。另声明 App 自有的 `Pictures/`，匹配 Capacitor 拍照回传的 JPEG 路径。
- `versionCode` 为 `1`，`versionName` 为 `1.0.0`。Capacitor `7.6.10` 工程使用 `compileSdkVersion 35`、`targetSdkVersion 35`、AGP `8.7.2` 和 Gradle Wrapper `8.11.1`，云端使用 Temurin JDK 21。[Capacitor 7 的安卓配置](https://capacitorjs.com/docs/v7/updating/7-0)。
- 工作台源码、原生桥接与桌面原件保持原样。原件和 `legacy/` 备份复核了相同的 SHA-256，桥接模拟检查通过。

## 流水线与本地验收

- `.github/workflows/build-android.yml` 可从 Actions 手动运行，也可由 `main` 或 `master` 的推送触发。`ubuntu-latest` 上使用 Node 20、pnpm `10.34.2` 和 Temurin JDK 21，启用 pnpm 缓存，检查 Android SDK Platform 35。pnpm 10 支持 Node 20 及项目的 `allowBuilds` 设置。[pnpm 与 Node 版本兼容性](https://pnpm.io/installation#compatibility)、[pnpm 10 构建许可配置](https://pnpm.io/10.x/settings#allowbuilds)。
- 云端依次执行锁文件安装、前端构建、Capacitor 同步、`chmod +x android/gradlew` 和 `./gradlew assembleDebug`，上传 `android/app/build/outputs/apk/debug/app-debug.apk`，Artifact 名为 `Longbing-Workbench-Android-Debug`。未在云端实际运行工作流。
- 本地 `pnpm run build` 和 `npx cap sync android` 均无报错通过。已静态校验工作流步骤与产物路径、Manifest、FileProvider、图标引用与 Wrapper JAR。未在本地运行 Gradle 或在真机验证拍照、分享及冷启动。
- 另用 Windows 临时目录和流水线同版本的 Node `20.20.2`、pnpm `10.34.2`，从干净目录复跑 `pnpm install --frozen-lockfile`、`pnpm run build` 和 `npx cap sync android`，均以退出码 `0` 完成。
- `.gitignore` 已排除依赖、前端产物、安卓构建缓存、本地 SDK 配置和 `*.iml`；Wrapper 两个脚本、JAR 及配置均存在且保留。`.gitattributes` 固定 Linux `gradlew` 的 LF。`git status` 返回当前目录不是 Git 仓库，推送前需在实际检出中确认这些文件已纳入版本控制。

## 指挥官操作三步

1. **准备提交。** 在另一个目录打开已有检出或克隆 [Longbing 仓库](https://github.com/fengchuanxiangzi787-tech/longbinggongzuotai)。将本工程的 `.github/`、`.gitignore`、`.gitattributes`、`android/`、`legacy/`、`resources/`、`scripts/`、`src/` 及根目录的 `index.html`、Vite / Capacitor 配置、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` 按原路径复制到检出。运行 `git status --short`，暂存要提交的文件，并用 `git ls-files -- android/gradlew android/gradlew.bat android/gradle/wrapper` 确认四个 Wrapper 文件均被跟踪。
2. **推送并触发。** 审阅暂存变更后运行 `git commit -m "Build Longbing Android app"`，再由你在目标仓库执行 `git push origin main`（若使用 `master` 则替换分支名）。也可以在仓库的 Actions 页面手动运行 `Build Android Debug APK`。
3. **下载 APK。** 在 Actions 打开成功的那次运行，从 Artifacts 下载 `Longbing-Workbench-Android-Debug` 并解压得到 `app-debug.apk`，用于安卓设备调试安装。
