// ========================================
// Shared device and viewport detection
// ========================================

/** 本地调试：优先用 UA 识别，方便 DevTools 模拟设备。调完后改回 false，恢复 getFrontend() 主判定。 */
const PREFER_USER_AGENT_FOR_LOCAL_DEBUG = false;

const MOBILE_USER_AGENT_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
const TABLET_UA_RE = /iPad|Tablet|SM-T|SM-X|SM-P|Lenovo TB|Nexus (7|9|10)/i;

const matchesMedia = (query) => {
    try {
        return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
    } catch (_) {
        return false;
    }
};

/**
 * 对齐思源官方 getFrontend()（app/src/util/functions.ts）。
 * 主题无法 import 'siyuan'，按同一规则在运行时复现：
 * - 移动端前端（存在 #editor）：UA 以 SiYuan/ 开头 → mobile，否则 → browser-mobile
 * - 桌面端前端：UA 以 SiYuan/ 开头且无 #toolbar → desktop-window
 *              UA 以 SiYuan/ 开头 → desktop
 *              否则 → browser-desktop
 */
export const getFrontend = () => {
    const ua = navigator.userAgent || "";
    const isNativeSiyuan = ua.startsWith("SiYuan/");
    const isMobileFrontend = !!document.getElementById("editor");

    if (isMobileFrontend) {
        return isNativeSiyuan ? "mobile" : "browser-mobile";
    }
    if (isNativeSiyuan) {
        return document.getElementById("toolbar") ? "desktop" : "desktop-window";
    }
    return "browser-desktop";
};

/** 与 Neo-Plus isMobile() 相同：getFrontend().endsWith("mobile") */
export const isSiyuanMobileFrontend = () => getFrontend().endsWith("mobile");

/** 官方移动端布局（思源移动端 HTML，存在 #editor） */
export const isOfficialMobileLayout = () => !!document.getElementById("editor");

/** 思源桌面客户端（Win / Mac / Linux）或桌面新窗口 */
const isSiyuanDesktopApp = () => {
    const body = document.body;
    return body.classList.contains("body--win32")
        || body.classList.contains("body--mac")
        || body.classList.contains("body--linux")
        || body.classList.contains("body--window");
};

/**
 * 真实触屏设备：仅用指针/悬停媒体查询。
 * 不用 maxTouchPoints（Electron 在 Windows 上常误报）。
 * 仅供调试报告，不参与主判定。
 */
export const isTouchCapable = () => {
    return matchesMedia("(pointer: coarse)") || matchesMedia("(hover: none)");
};

export const isMobileUserAgent = () => MOBILE_USER_AGENT_RE.test(navigator.userAgent || "");

/**
 * 平板：跑桌面前端（有 #toolbar、无 #editor），但设备是平板。
 * 思源安卓/iPad 大屏会走 desktop frontend，不能当成手机移动端布局。
 */
export const isTabletDevice = () => {
    if (isOfficialMobileLayout()) return false;
    if (isSiyuanDesktopApp()) return false;
    if (!document.getElementById("toolbar")) return false;

    const ua = navigator.userAgent || "";
    if (TABLET_UA_RE.test(ua)) return true;

    // Chrome 安卓平板 UA 通常不含 Mobile；需同时是触屏，避免误伤桌面浏览器
    const isAndroid = /Android/i.test(ua);
    const hasMobileToken = /\bMobile\b/i.test(ua);
    return isAndroid && !hasMobileToken && isTouchCapable();
};

/** 浏览器里的官方移动端页面，或本地用 UA 模拟的移动端 */
export const isLikelyMobileBrowser = () => {
    if (getFrontend() === "browser-mobile") return true;
    if (PREFER_USER_AGENT_FOR_LOCAL_DEBUG && isMobileUserAgent() && !isOfficialMobileLayout()) {
        return true;
    }
    return false;
};

/** 主题移动端布局：本地调试优先 UA，否则用思源 frontend */
export const shouldUseMobileThemeLayout = () => {
    if (PREFER_USER_AGENT_FOR_LOCAL_DEBUG && isMobileUserAgent()) return true;
    return isSiyuanMobileFrontend();
};

export const shouldLimitDesktopEnhancements = () => shouldUseMobileThemeLayout();

/** 手机移动端或平板：关掉顶栏悬浮，始终显示顶栏 */
export const shouldDisableTopbarFloat = () => shouldUseMobileThemeLayout() || isTabletDevice();

/** 返回设备检测详情，供调试顶栏等功能使用 */
export const getDeviceDetectionReport = () => {
    const ua = navigator.userAgent || "";
    const hasEditor = !!document.getElementById("editor");
    const hasToolbar = !!document.getElementById("toolbar");
    const isNativeSiyuan = ua.startsWith("SiYuan/");
    const frontend = getFrontend();
    const officialMobile = isOfficialMobileLayout();
    const siyuanDesktop = isSiyuanDesktopApp();
    const touchCapable = isTouchCapable();
    const mobileUA = isMobileUserAgent();
    const likelyMobileBrowser = isLikelyMobileBrowser();
    const useMobileLayout = shouldUseMobileThemeLayout();
    const tablet = isTabletDevice();
    const disableTopbarFloat = shouldDisableTopbarFloat();
    const bodyClasses = [...document.body.classList];

    const decisionTrace = [
        `0. 本地调试优先 UA: ${PREFER_USER_AGENT_FOR_LOCAL_DEBUG}`,
        `1. UA 是否匹配移动端: ${mobileUA}`,
        `2. 是否官方移动端页面（存在 #editor）: ${hasEditor}`,
        `3. 是否存在桌面顶栏 #toolbar: ${hasToolbar}`,
        `4. UA 是否以 SiYuan/ 开头（原生客户端）: ${isNativeSiyuan}`,
        `5. 复现 getFrontend() = ${frontend}`,
        `6. 是否平板: ${tablet}`,
        `7. 最终 shouldUseMobileThemeLayout = ${useMobileLayout}`,
        `8. 最终 shouldDisableTopbarFloat = ${disableTopbarFloat}`,
    ];

    const mobileLayoutReasons = [];
    if (PREFER_USER_AGENT_FOR_LOCAL_DEBUG && mobileUA) {
        mobileLayoutReasons.push("本地调试：User-Agent 匹配移动端");
    } else if (useMobileLayout) {
        mobileLayoutReasons.push(`思源 getFrontend() = ${frontend}（以 mobile 结尾）`);
    } else if (tablet) {
        mobileLayoutReasons.push("识别为平板：桌面前端 + 平板设备，仅固定顶栏，不启用手机移动端布局");
    } else {
        mobileLayoutReasons.push(`非手机移动端前端，且未命中平板判定；getFrontend() = ${frontend}`);
    }

    const topbarFloatDisabledReasons = [];
    if (useMobileLayout) {
        topbarFloatDisabledReasons.push(`启用移动端布局 → body 将添加 body--mobile（${mobileLayoutReasons.join("；")}）`);
    } else if (tablet) {
        topbarFloatDisabledReasons.push("识别为平板 → body 将添加 body--tablet，仅关闭顶栏悬浮");
    }

    const 结论 = useMobileLayout ? "识别为移动端" : tablet ? "识别为平板端" : "识别为桌面端";

    return {
        结论,
        frontend,
        frontendNote: PREFER_USER_AGENT_FOR_LOCAL_DEBUG
            ? "当前为本地调试：优先 UA，其次 getFrontend()"
            : "主判定：与 Neo / 思源插件 API getFrontend() 对齐，以 mobile 结尾则视为移动端",
        preferUserAgentForLocalDebug: PREFER_USER_AGENT_FOR_LOCAL_DEBUG,
        decisionTrace,
        hasEditor,
        hasToolbar,
        isNativeSiyuan,
        userAgent: ua,
        platform: navigator.platform,
        innerWidth: window.innerWidth,
        screenWidth: window.screen?.width,
        maxTouchPoints: navigator.maxTouchPoints,
        maxTouchPointsNote: "仅作参考，不参与判定（Electron 在 Windows 上可能误报）",
        pointerCoarse: matchesMedia("(pointer: coarse)"),
        hoverNone: matchesMedia("(hover: none)"),
        isSiyuanDesktopApp: siyuanDesktop,
        isOfficialMobileLayout: officialMobile,
        isTouchCapable: touchCapable,
        isMobileUserAgent: mobileUA,
        isLikelyMobileBrowser: likelyMobileBrowser,
        isTabletDevice: tablet,
        shouldUseMobileThemeLayout: useMobileLayout,
        shouldDisableTopbarFloat: disableTopbarFloat,
        mobileLayoutReasons,
        bodyClasses,
        bodyHasMobileClass: document.body.classList.contains("body--mobile"),
        bodyHasTabletClass: document.body.classList.contains("body--tablet"),
        topbarFloatEnabled: !disableTopbarFloat,
        topbarFloatDisabledReasons,
    };
};

/** 把识别过程打到控制台，便于对照 DevTools 模拟结果 */
export const logDeviceDetection = () => {
    const report = getDeviceDetectionReport();
    const method = report.topbarFloatEnabled ? "warn" : "log";
    console[method]("[my_theme 设备识别]", report.结论, {
        判定步骤: report.decisionTrace,
        原因: report.mobileLayoutReasons,
        详情: report,
    });
};
