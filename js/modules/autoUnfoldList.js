/* ------- 聚焦折叠列表项时自动展开 ---------- */
/* 原实现 by JeffreyChen https://ld246.com/article/1748934188341 */
/* 3.8.2：事件总线改为按需订阅，伪造 Plugin 收不到 loaded-protyle-static */

const SKIP_PLUGIN_NAMES = new Set(["my-custom-plugin", "my-theme-auto-unfold"]);

function unfoldFocusedList(wysiwyg) {
  if (wysiwyg?.dataset?.docType !== "NodeListItem") return;
  wysiwyg.querySelector(":scope > [data-node-id].li")?.removeAttribute("fold");
}

function eventBusHandler(event) {
  if (event?.type !== "loaded-protyle-static" && event?.type !== "switch-protyle") return;
  unfoldFocusedList(event?.detail?.protyle?.wysiwyg?.element);
}

function getHostPlugin() {
  const plugins = window.siyuan?.ws?.app?.plugins;
  if (!Array.isArray(plugins)) return null;
  return plugins.find((plugin) => plugin?.eventBus && !SKIP_PLUGIN_NAMES.has(plugin.name)) || null;
}

function removeFakePlugin() {
  const plugins = window.siyuan?.ws?.app?.plugins;
  if (!Array.isArray(plugins)) return;
  const index = plugins.findIndex((plugin) => plugin?.name === "my-custom-plugin");
  if (index >= 0) plugins.splice(index, 1);
}

function subscribeOnRealEventBus(handler) {
  const host = getHostPlugin();
  if (!host) return false;

  try {
    const bus = new host.eventBus.constructor();
    bus.on("loaded-protyle-static", handler);
    bus.on("switch-protyle", handler);
    return true;
  } catch {
    host.eventBus.on("loaded-protyle-static", handler);
    host.eventBus.on("switch-protyle", handler);
    return true;
  }
}

function observeFocusedLists() {
  const scan = (root = document) => {
    if (root !== document && root.nodeType !== 1) return;
    if (root.matches?.(".protyle-wysiwyg")) unfoldFocusedList(root);
    root.querySelectorAll?.(".protyle-wysiwyg[data-doc-type='NodeListItem']").forEach(unfoldFocusedList);
  };

  scan();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        const target = mutation.target;
        if (target.matches?.(".protyle-wysiwyg")) unfoldFocusedList(target);
        else if (target.parentElement?.matches?.(".protyle-wysiwyg")) unfoldFocusedList(target.parentElement);
        continue;
      }
      mutation.addedNodes.forEach((node) => scan(node));
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-doc-type", "fold"],
  });
}

function autoUnfoldList() {
  removeFakePlugin();

  if (!subscribeOnRealEventBus(eventBusHandler)) {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (subscribeOnRealEventBus(eventBusHandler) || Date.now() - startedAt > 15000) {
        clearInterval(timer);
      }
    }, 300);
  }

  observeFocusedLists();
}

export const initAutoUnfoldList = () => {
  autoUnfoldList();
  console.log("加载自动展开列表成功");
};
