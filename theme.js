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

/* ----------------------------- 顶栏悬浮 from Savor ---------------------------- */
function topbarfixedButton() {
  notionThemeToolplusAddButton(
    "topBar",
    "toolbar__item b3-tooltips b3-tooltips__sw",
    "隐藏顶栏",
    "/appearance/themes/Savor/img/topbar2.svg",
    "/appearance/themes/Savor/img/topbar.svg",
    () => {
      loadStyle("/appearance/themes/Savor/style/topbar/top-fixed.css", "topbar隐藏").setAttribute(
        "topBarcss",
        "topbar隐藏"
      );
    },
    () => {
      document.getElementById("topbar隐藏").remove();
    },
    true
  );
}

/* -------自动展开悬浮窗折叠列表,展开搜索条目折叠列表,聚焦单独列表 from Savor ---------- */
function autoOpenList() {
  setInterval(() => {
    //找到所有的悬浮窗
    var Preview = document.querySelectorAll("[data-oid]");

    //如果发现悬浮窗内首行是折叠列表就展开并打上标记
    if (Preview.length != 0) {
      for (let index = 0; index < Preview.length; index++) {
        const element = Preview[index];
        var item = element.children[1].children;

        for (let index = 0; index < item.length; index++) {
          var obj = item[index].children[1];
          if (obj == null) continue;
          const element = obj.children[0].children[0];
          if (element == null) continue;
          if (element.className != "li") continue; //判断是否是列表
          if (element.getAttribute("foldTag") != null) continue; //判断是否存在标记
          if (element.getAttribute("foid") == 0) continue; //判断是折叠

          element.setAttribute("fold", 0);
          element.setAttribute("foldTag", true);
        }
      }
    }

    var searchPreview = document.querySelector(
      "#searchPreview [data-doc-type='NodeListItem'].protyle-wysiwyg.protyle-wysiwyg--attr>div:nth-child(1)"
    );
    if (
      searchPreview != null &&
      searchPreview.getAttribute("data-type") == "NodeListItem" &&
      searchPreview.getAttribute("fold") == 1
    ) {
      if (searchPreview.getAttribute("foldTag") != null) return; //判断是否存在标记
      searchPreview.setAttribute("fold", 0);
      searchPreview.setAttribute("foldTag", true);
    }

    var contentLIst = document.querySelectorAll(
      ".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-doc-type='NodeListItem'].protyle-wysiwyg.protyle-wysiwyg--attr>div:nth-child(1)"
    );
    for (let index = 0; index < contentLIst.length; index++) {
      const element = contentLIst[index];
      if (
        element != null &&
        element.getAttribute("data-type") == "NodeListItem" &&
        element.getAttribute("fold") == 1
      ) {
        if (element.getAttribute("foldTag") != null) return; //判断是否存在标记
        element.setAttribute("fold", 0);
        element.setAttribute("foldTag", true);
      }
    }
  }, 500);
}

/* ---------------------------- 辅助API from Savor ---------------------------- */
/**
 * 为元素注册监听事件
 * @param {Element} element
 * @param {string} strType
 * @param {Fun} fun
 */
function AddEvent(element, strType, fun) {
  //判断浏览器有没有addEventListener方法
  if (element.addEventListener) {
    element.addEventListener(strType, fun, false);
    //判断浏览器有没 有attachEvent IE8的方法
  } else if (element.attachEvent) {
    element.attachEvent("on" + strType, fun);
    //如果都没有则使用 元素.事件属性这个基本方法
  } else {
    element["on" + strType] = fun;
  }
}

/**
 *
 * @param {*} element 元素是否在思源悬浮窗中
 * @returns 是返回悬浮窗元素，否返回null
 */
function isSiyuanFloatingWindow(element) {
  return isFatherFather(element, (v) => {
    if (v.getAttribute("data-oid") != null) {
      return true;
    }
    return false;
  });
}

/**
 * 不断查找元素父级的父级知道这个父级符合条件函数
 * @param {*} element 起始元素
 * @param {*} judgeFun 条件函数
 * @param {*} upTimes 限制向上查找父级次数
 * @returns 返回符合条件的父级，或null
 */
function isFatherFather(element, judgeFun, upTimes) {
  var i = 0;
  for (;;) {
    if (!element) return null;
    if (upTimes < 1 || i >= upTimes) return null;
    if (judgeFun(element)) return element;
    element = element.parentElement;
    i++;
  }
}

/**设置思源块展开 */
function setBlockfold_0(BlockId) {
  设置思源块属性(BlockId, { fold: "0" });
}

/**设置思源块折叠 */
function setBlockfold_1(BlockId) {
  设置思源块属性(BlockId, { fold: "1" });
}

/**----------------鼠标中键标题、列表文本折叠/展开 from Savor----------------*/
function collapseExpand_Head_List() {
  var flag45 = false;
  AddEvent(document.body, "mouseup", () => {
    flag45 = false;
  });

  AddEvent(document.body, "mousedown", (e) => {
    if (e.button == 2) {
      flag45 = true;
      return;
    }
    if (flag45 || e.shiftKey || e.altKey || e.button != 1) return;
    var target = e.target;

    if (target.getAttribute("contenteditable") == null) {
      isFatherFather(
        target,
        (v) => {
          if (v.getAttribute("contenteditable") != null) {
            target = v;
            return true;
          }
          return false;
        },
        10
      );
    }

    var targetParentElement = target.parentElement;
    if (targetParentElement == null) return;

    //是标题吗？
    if (
      targetParentElement != null &&
      targetParentElement.getAttribute("data-type") == "NodeHeading"
    ) {
      var targetParentElementParentElement = targetParentElement.parentElement;
      //标题父元素是列表吗？
      if (
        targetParentElementParentElement != null &&
        targetParentElementParentElement.getAttribute("data-type") == "NodeListItem"
      ) {
        e.preventDefault();
        //列表项实现折叠
        _collapseExpand_NodeListItem(target);
      } else {
        e.preventDefault();
        //标题块标项实现折叠
        _collapseExpand_NodeHeading(target);
      }
    } else {
      //是列表
      var targetParentElementParentElement = targetParentElement.parentElement;
      if (
        targetParentElementParentElement != null &&
        targetParentElementParentElement.getAttribute("data-type") == "NodeListItem"
      ) {
        e.preventDefault();
        //列表项实现折叠
        _collapseExpand_NodeListItem(target);
      }
    }
  });

  //标题，块标实现折叠
  function _collapseExpand_NodeHeading(element) {
    var i = 0;
    while (
      element.className != "protyle" &&
      element.className != "fn__flex-1 protyle" &&
      element.className != "block__edit fn__flex-1 protyle" &&
      element.className != "fn__flex-1 spread-search__preview protyle"
    ) {
      if (i == 999) return;
      i++;
      element = element.parentElement;
    }
    var ddddd = element.children;
    for (let index = ddddd.length - 1; index >= 0; index--) {
      const element = ddddd[index];
      if (element.className == "protyle-gutters") {
        var fold = diguiTooONE_1(element, (v) => {
          return v.getAttribute("data-type") === "fold";
        });
        if (fold != null) fold.click();
        return;
      }
    }
  }

  //列表，列表项实现折叠
  function _collapseExpand_NodeListItem(element) {
    //在悬浮窗中第一个折叠元素吗？
    var SiyuanFloatingWindow = isSiyuanFloatingWindow(element);
    if (SiyuanFloatingWindow) {
      var vs = isFatherFather(element, (v) => v.classList.contains("li"), 7);
      if (vs != null && vs.previousElementSibling == null) {
        var foid = vs.getAttribute("fold");
        if (foid == null || foid == "0") {
          //判断是折叠
          vs.setAttribute("fold", "1");
        } else {
          vs.setAttribute("fold", "0");
        }
        return;
      }
    }

    var i = 0;
    while (element.getAttribute("contenteditable") == null) {
      if (i == 999) return;
      i++;
      element = element.parentElement;
    }
    var elementParentElement = element.parentElement.parentElement;

    var fold = elementParentElement.getAttribute("fold");

    if (elementParentElement.children.length == 3) return;

    if (fold == null || fold == "0") {
      setBlockfold_1(elementParentElement.getAttribute("data-node-id"));
    } else {
      setBlockfold_0(elementParentElement.getAttribute("data-node-id"));
    }
  }
}

(async () => {
  autoOpenList();
  collapseExpand_Head_List();
  console.log("加载Savor的列表相关辅助JS成功");
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
