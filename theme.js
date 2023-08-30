/* ------------------------ 日夜主题加载 from notion-theme ------------------------ */
window.theme = {};
/**
 * 加载样式文件
 * @params {string} href 样式地址
 * @params {string} id 样式 ID
 */
window.theme.loadStyle = function (href, id = null) {
  let style = document.createElement("link");
  if (id) style.id = id;
  style.type = "text/css";
  style.rel = "stylesheet";
  style.href = href;
  document.head.appendChild(style);
};

/**
 * 更新样式文件
 * @params {string} id 样式文件 ID
 * @params {string} href 样式文件地址
 */
window.theme.updateStyle = function (id, href) {
  let style = document.getElementById(id);
  if (style) {
    style.setAttribute("href", href);
  } else {
    window.theme.loadStyle(href, id);
  }
};

window.theme.ID_COLOR_STYLE = "theme-color-style";

/**
 * 获取主题模式
 * @return {string} light 或 dark
 */
window.theme.themeMode = (() => {
  /* 根据配置选项判断主题 */
  switch (window.siyuan.config.appearance.mode) {
    case 0:
      return "light";
    case 1:
      return "dark";
    default:
      return null;
  }
})();

/**
 * 更换主题模式
 * @params {string} lightStyle 浅色主题配置文件路径
 * @params {string} darkStyle 深色主题配置文件路径
 */
window.theme.changeThemeMode = function (lightStyle, darkStyle) {
  let href_color = null;
  switch (window.theme.themeMode) {
    case "light":
      href_color = lightStyle;
      break;
    case "dark":
    default:
      href_color = darkStyle;
      break;
  }
  window.theme.updateStyle(window.theme.ID_COLOR_STYLE, href_color);
};

/* 根据当前主题模式加载样式配置文件 */
window.theme.changeThemeMode(
  `/appearance/themes/my_theme/style/01-color-font/color-day.css`,
  `/appearance/themes/my_theme/style/01-color-font/color-night.css`
);

/* ---------------------------- 层次子弹线 by mdzz2048 --------------------------- */
/**
 * 获得指定块位于的编辑区
 * @params {HTMLElement}
 * @return {HTMLElement} 光标所在块位于的编辑区
 * @return {null} 光标不在块内
 */
function getTargetEditor(block) {
  while (block != null && !block.classList.contains("protyle-wysiwyg")) block = block.parentElement;
  return block;
}

/**
 * 获得焦点所在的块
 * @return {HTMLElement} 光标所在块
 * @return {null} 光标不在块内
 */
function getFocusedBlock() {
  if (document.activeElement.classList.contains("protyle-wysiwyg")) {
    let block = window.getSelection()?.focusNode?.parentElement; // 当前光标
    while (block != null && block.dataset.nodeId == null) block = block.parentElement;
    return block;
  }
}

function focusHandler() {
  /* 获取当前编辑区 */
  let block = getFocusedBlock(); // 当前光标所在块
  /* 当前块已经设置焦点 */
  if (block?.classList.contains(`block-focus`)) return;

  /* 当前块未设置焦点 */
  const editor = getTargetEditor(block); // 当前光标所在块位于的编辑区
  if (editor) {
    editor
      .querySelectorAll(`.block-focus`)
      .forEach((element) => element.classList.remove(`block-focus`));
    block.classList.add(`block-focus`);
    // setSelector(block);
  }
}

function bulletMain() {
  // 跟踪当前所在块
  window.addEventListener("mouseup", focusHandler, true);
  window.addEventListener("keyup", focusHandler, true);
}

(async () => {
  bulletMain();
  console.log("加载子弹线成功");
})();

/***js form Morgan***/
/****************************思源API操作**************************/
async function 设置思源块属性(内容块id, 属性对象) {
  let url = "/api/attr/setBlockAttrs";
  return 解析响应体(
    向思源请求数据(url, {
      id: 内容块id,
      attrs: 属性对象,
    })
  );
}
async function 向思源请求数据(url, data) {
  let resData = null;
  await fetch(url, {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      Authorization: `Token ''`,
    },
  }).then(function (response) {
    resData = response.json();
  });
  return resData;
}
async function 解析响应体(response) {
  let r = await response;
  return r.code === 0 ? r.data : null;
}

/****UI****/
function ViewSelect(selectid, selecttype) {
  let button = document.createElement("button");
  button.id = "viewselect";
  button.className = "b3-menu__item";
  button.innerHTML =
    '<svg class="b3-menu__icon" style="null"><use xlink:href="#iconGlobalGraph"></use></svg><span class="b3-menu__label" style="">视图选择</span><svg class="b3-menu__icon b3-menu__icon--arrow" style="null"><use xlink:href="#iconRight"></use></svg></button>';
  button.appendChild(SubMenu(selectid, selecttype));
  return button;
}

function SubMenu(selectid, selecttype, className = "b3-menu__submenu") {
  let node = document.createElement("div");
  node.className = className;
  if (selecttype == "NodeList") {
    node.appendChild(GraphView(selectid));
    node.appendChild(TableView(selectid));
    node.appendChild(kanbanView(selectid));
    node.appendChild(DefaultView(selectid));
  }
  if (selecttype == "NodeTable") {
    node.appendChild(FixWidth(selectid));
    node.appendChild(AutoWidth(selectid));
    node.appendChild(Removeth(selectid));
    node.appendChild(Defaultth(selectid));
  }
  return node;
}

function GraphView(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "dt");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconFiles"></use></svg><span class="b3-menu__label">转换为导图</span>`;
  button.onclick = ViewMonitor;
  return button;
}
function TableView(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "bg");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">转换为表格</span>`;
  button.onclick = ViewMonitor;
  return button;
}
function kanbanView(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "kb");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconMenu"></use></svg><span class="b3-menu__label">转换为看板</span>`;
  button.onclick = ViewMonitor;
  return button;
}
function DefaultView(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.onclick = ViewMonitor;
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconList"></use></svg><span class="b3-menu__label">恢复为列表</span>`;
  return button;
}
function FixWidth(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.onclick = ViewMonitor;
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">页面宽度</span>`;
  return button;
}
function AutoWidth(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "f");
  button.setAttribute("custom-attr-value", "auto");
  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">自动宽度</span>`;
  button.onclick = ViewMonitor;
  return button;
}
function Removeth(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.onclick = ViewMonitor;
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "t");
  button.setAttribute("custom-attr-value", "biaotou");

  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">取消表头样式</span>`;
  return button;
}
function Defaultth(selectid) {
  let button = document.createElement("button");
  button.className = "b3-menu__item";
  button.setAttribute("data-node-id", selectid);
  button.setAttribute("custom-attr-name", "t");
  button.setAttribute("custom-attr-value", "");
  button.innerHTML = `<svg class="b3-menu__icon" style=""><use xlink:href="#iconTable"></use></svg><span class="b3-menu__label">默认表头样式</span>`;
  button.onclick = ViewMonitor;
  return button;
}
function MenuSeparator(className = "b3-menu__separator") {
  let node = document.createElement("button");
  node.className = className;
  return node;
}

/* 操作 */

/**
 * 获得所选择的块对应的块 ID
 * @returns {string} 块 ID
 * @returns {
 *     id: string, // 块 ID
 *     type: string, // 块类型
 *     subtype: string, // 块子类型(若没有则为 null)
 * }
 * @returns {null} 没有找到块 ID */
function getBlockSelected() {
  let node_list = document.querySelectorAll(
    ".protyle:not(.fn__none)>.protyle-content .protyle-wysiwyg--select"
  );
  if (node_list.length === 1 && node_list[0].dataset.nodeId != null)
    return {
      id: node_list[0].dataset.nodeId,
      type: node_list[0].dataset.type,
      subtype: node_list[0].dataset.subtype,
    };
  return null;
}

function ClickMonitor() {
  window.addEventListener("mouseup", MenuShow);
}

function MenuShow() {
  setTimeout(() => {
    let selectinfo = getBlockSelected();
    if (selectinfo) {
      let selecttype = selectinfo.type;
      let selectid = selectinfo.id;
      if (selecttype == "NodeList" || selecttype == "NodeTable") {
        setTimeout(() => InsertMenuItem(selectid, selecttype), 0);
      }
    }
  }, 0);
}

function InsertMenuItem(selectid, selecttype) {
  let commonMenu = document.getElementById("commonMenu");
  let readonly = commonMenu.querySelector(".b3-menu__item--readonly");
  let selectview = commonMenu.querySelector('[id="viewselect"]');
  if (readonly) {
    if (!selectview) {
      commonMenu.insertBefore(ViewSelect(selectid, selecttype), readonly);
      commonMenu.insertBefore(MenuSeparator(), readonly);
    }
  }
}

function ViewMonitor(event) {
  let id = event.currentTarget.getAttribute("data-node-id");
  let attrName = "custom-" + event.currentTarget.getAttribute("custom-attr-name");
  let attrValue = event.currentTarget.getAttribute("custom-attr-value");
  let blocks = document.querySelectorAll(`.protyle-wysiwyg [data-node-id="${id}"]`);
  if (blocks) {
    blocks.forEach((block) => block.setAttribute(attrName, attrValue));
  }
  let attrs = {};
  attrs[attrName] = attrValue;
  设置思源块属性(id, attrs);
}

setTimeout(() => ClickMonitor(), 1000);
