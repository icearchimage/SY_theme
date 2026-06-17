// ========================================
// Shared device and viewport detection
// ========================================

const MOBILE_USER_AGENT_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

const matchesMedia = (query) => {
    try {
        return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
    } catch (_) {
        return false;
    }
};

/** 思源桌面客户端（Win / Mac / Linux） */
const isSiyuanDesktopApp = () => {
    const body = document.body;
    return body.classList.contains("body--win32")
        || body.classList.contains("body--mac")
        || body.classList.contains("body--linux")
        || body.classList.contains("body--window");
};

export const isOfficialMobileLayout = () => !!document.getElementById("editor");

/**
 * 真实触屏设备：仅用指针/悬停媒体查询。
 * 不用 maxTouchPoints（Electron 在 Windows 上常误报，如 maxTouchPoints: 20）。
 */
export const isTouchCapable = () => {
    return matchesMedia("(pointer: coarse)") || matchesMedia("(hover: none)");
};

export const isMobileUserAgent = () => MOBILE_USER_AGENT_RE.test(navigator.userAgent || "");

/** 浏览器环境下的移动端判定（不含分辨率） */
export const isLikelyMobileBrowser = () => {
    if (isOfficialMobileLayout()) return false;
    if (isSiyuanDesktopApp()) return false;

    return isMobileUserAgent() || isTouchCapable();
};

export const shouldUseMobileThemeLayout = () => {
    if (isOfficialMobileLayout()) return true;
    if (isSiyuanDesktopApp()) return false;

    return isLikelyMobileBrowser();
};

export const shouldLimitDesktopEnhancements = () => shouldUseMobileThemeLayout();

/** 返回设备检测详情，供调试顶栏等功能使用 */
export const getDeviceDetectionReport = () => {
    const officialMobile = isOfficialMobileLayout();
    const siyuanDesktop = isSiyuanDesktopApp();
    const touchCapable = isTouchCapable();
    const mobileUA = isMobileUserAgent();
    const likelyMobileBrowser = isLikelyMobileBrowser();
    const useMobileLayout = shouldUseMobileThemeLayout();
    const bodyClasses = [...document.body.classList];

    const mobileLayoutReasons = [];
    if (officialMobile) mobileLayoutReasons.push("官方移动端布局（存在 #editor 元素）");
    if (siyuanDesktop && !officialMobile) mobileLayoutReasons.push("思源桌面客户端（body--win32/mac/linux/window）→ 不启用移动端布局");
    if (!officialMobile && !siyuanDesktop && mobileUA) mobileLayoutReasons.push("User-Agent 匹配移动端");
    if (!officialMobile && !siyuanDesktop && touchCapable) {
        mobileLayoutReasons.push("指针/悬停媒体查询判定为触屏设备");
    }

    const topbarFloatDisabledReasons = [];
    if (useMobileLayout) {
        topbarFloatDisabledReasons.push(`启用移动端布局 → body 将添加 body--mobile（${mobileLayoutReasons.join("；")}）`);
    }

    return {
        userAgent: navigator.userAgent,
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
        shouldUseMobileThemeLayout: useMobileLayout,
        mobileLayoutReasons,
        bodyClasses,
        topbarFloatEnabled: !useMobileLayout,
        topbarFloatDisabledReasons,
    };
};
