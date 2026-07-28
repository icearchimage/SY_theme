/* ------- 聚焦折叠列表项时自动展开 ---------- */
/* author by JeffreyChen https://ld246.com/article/1748934188341 */

function eventBusOn(eventName, callback) {
  const plugin = getMyPlugin();
  plugin.eventBus.on(eventName, callback);
}

function getMyPlugin(pluginName = "my-custom-plugin") {
  let myPlugin = window.siyuan.ws.app.plugins.find((item) => item.name === pluginName);
  if (myPlugin) return myPlugin;

  class EventBus {
    constructor(name = "") {
      this.eventTarget = document.createComment(name);
      document.appendChild(this.eventTarget);
    }
    on(type, listener) {
      this.eventTarget.addEventListener(type, listener);
    }
    once(type, listener) {
      this.eventTarget.addEventListener(type, listener, { once: true });
    }
    off(type, listener) {
      this.eventTarget.removeEventListener(type, listener);
    }
    emit(type, detail) {
      return this.eventTarget.dispatchEvent(new CustomEvent(type, { detail, cancelable: true }));
    }
  }

  class Plugin {
    constructor(options) {
      this.app = options.app || window.siyuan.ws.app.appId;
      this.i18n = options.i18n;
      this.displayName = options.displayName || options.name;
      this.name = options.name;
      this.eventBus = new EventBus(options.name);
      this.protyleSlash = [];
      this.customBlockRenders = {};
      this.topBarIcons = [];
      this.statusBarIcons = [];
      this.commands = [];
      this.models = {};
      this.docks = {};
      this.data = {};
      this.protyleOptionsValue = null;
    }
    onload() {}
    onunload() {}
    uninstall() {}
    async updateCards(options) {
      return options;
    }
    onLayoutReady() {}
    addCommand(command) {}
    addIcons(svg) {}
    addTopBar(options) {
      return null;
    }
    addStatusBar(options) {
      return null;
    }
    loadData(storageName) {
      return Promise.resolve(null);
    }
    saveData(storageName, data) {
      return Promise.resolve();
    }
    removeData(storageName) {
      return Promise.resolve();
    }
    getOpenedTab() {
      return {};
    }
    addTab(options) {
      return () => {};
    }
    addDock(options) {
      return {};
    }
    addFloatLayer(options) {}
    updateProtyleToolbar(toolbar) {
      return toolbar;
    }
    set protyleOptions(options) {}
    get protyleOptions() {
      return this.protyleOptionsValue;
    }
  }

  myPlugin = new Plugin({ name: pluginName });
  window.siyuan.ws.app.plugins.push(myPlugin);
  return myPlugin;
}

function eventBusHandler(args) {
  if (args.type !== "loaded-protyle-static") return;

  // 编辑器加载完成：聚焦折叠列表项时自动展开
  // 原理：仅用 CSS 覆盖块标不会变，需用 JS；移除 fold="1" 后编辑只影响子块，不会保存展开状态
  const wysiwyg = args.detail.protyle.wysiwyg.element;
  if (wysiwyg?.dataset.docType === "NodeListItem") {
    wysiwyg.querySelector(":scope > [data-node-id].li")?.removeAttribute("fold");
  }
}

function autoUnfoldList() {
  eventBusOn("loaded-protyle-static", eventBusHandler);
}

export const initAutoUnfoldList = () => {
  autoUnfoldList();
  console.log("加载自动展开列表成功");
};
