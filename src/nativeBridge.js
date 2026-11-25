import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';

const backOverlays = [];
const isAndroid = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export async function exportFile(filename, contents, mimeType) {
  const safeName = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  const blob = contents instanceof Blob ? contents : new Blob([contents], { type: mimeType });

  if (Capacitor.isNativePlatform()) {
    const file = await Filesystem.writeFile({
      path: `exports/${newExportId()}/${safeName}`,
      data: await toBase64(blob),
      directory: Directory.Cache,
      recursive: true,
    });
    try {
      await Share.share({ files: [file.uri], dialogTitle: `分享或保存 ${safeName}` });
    } catch (error) {
      // Android Share rejects when the chooser is dismissed without a target.
      if (!/cancel(?:l?ed|lation)?/i.test(error?.message ?? '')) throw error;
    }
    return 'native';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return 'web';
}

function newExportId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',', 2)[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function copyToClipboard(text, { html } = {}) {
  if (Capacitor.isNativePlatform()) {
    await Clipboard.write({ string: text });
    return 'plain';
  }

  if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      })]);
      return 'rich';
    } catch {
      // A browser may permit plain text while blocking richer formats.
    }
  }
  await navigator.clipboard.writeText(text);
  return 'plain';
}

export function openExternalLink(event, onError) {
  if (!Capacitor.isNativePlatform() || event.defaultPrevented) return;
  event.preventDefault();
  const url = event.currentTarget.href;
  if (!/^https?:\/\//i.test(url)) {
    onError('仅支持打开 HTTP 或 HTTPS 网址');
    return;
  }
  Browser.open({ url }).catch(() => onError('无法打开该网址，请检查链接'));
}

export function registerBackOverlay(close) {
  if (!isAndroid()) return;
  const overlay = { close };
  backOverlays.push(overlay);
  return () => {
    const index = backOverlays.indexOf(overlay);
    if (index !== -1) backOverlays.splice(index, 1);
  };
}

export function installAndroidBackHandler({ isHome, goHome, notify }) {
  if (!isAndroid()) return;
  let lastHomePress = null;
  let active = true;
  const listener = App.addListener('backButton', () => {
    if (!active) return;
    const overlay = backOverlays.at(-1);
    if (overlay || !isHome()) {
      lastHomePress = null;
      if (overlay) overlay.close();
      else goHome();
      return;
    }

    const now = performance.now();
    if (lastHomePress !== null && now - lastHomePress < 2000) {
      lastHomePress = null;
      void App.exitApp().catch(() => notify('无法退出应用', true));
    } else {
      lastHomePress = now;
      notify('再按一次返回退出', false, 2000);
    }
  });
  listener.catch(error => console.warn('Unable to register Android back button', error));

  return () => {
    active = false;
    listener.then(handle => handle.remove()).catch(() => {});
  };
}

export function syncStatusBar(dark, darkTopbar = false) {
  if (!isAndroid()) return;
  void StatusBar.setStyle({ style: dark || darkTopbar ? Style.Dark : Style.Light })
    .catch(error => console.warn('Unable to update Android status bar', error));
  void StatusBar.setBackgroundColor({ color: darkTopbar ? '#101012' : dark ? '#17212b' : '#f3f6f8' })
    .catch(error => console.warn('Unable to set Android status bar color', error));
}
