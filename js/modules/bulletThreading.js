/* ---------------------------- 层次子弹线 ---------------------------- */
/* 跟踪方式对齐 Neo-Plus：selectionchange + 点击圆点，不依赖 activeElement / mouseup */

const FOCUS_CLASS = "block-focus";
const FOCUS_SELF_CLASS = "block-focus-self";
const MARK_CLASSES = ["li", "list", "bq", "sb"];

let debounceTimer = null;
let lastEditor = null;

function asElement(node) {
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function collectFocusPath(startNode) {
  const listItems = [];
  const toMark = [];
  let leafBlock = null;
  let editor = null;
  let node = asElement(startNode);

  while (node) {
    if (node.dataset?.nodeId) {
      if (!leafBlock) leafBlock = node;
      if (MARK_CLASSES.some((cls) => node.classList.contains(cls))) {
        toMark.push(node);
      }
      if (node.classList.contains("li") || node.dataset.type === "NodeListItem") {
        listItems.push(node);
      }
    }
    if (node.classList?.contains("protyle-wysiwyg")) {
      editor = node;
      break;
    }
    node = node.parentElement;
  }

  return { listItems, toMark, leafBlock, editor };
}

function clearFocus(root) {
  root.querySelectorAll(`.${FOCUS_CLASS}, .${FOCUS_SELF_CLASS}`).forEach((element) => {
    element.classList.remove(FOCUS_CLASS, FOCUS_SELF_CLASS);
    element.style.removeProperty("--li-bullet-line-height");
    element.style.removeProperty("--li-bullet-line-top");
  });
}

function bulletCenterY(listItem) {
  const action = listItem.querySelector(":scope > .protyle-action");
  if (action) {
    const rect = action.getBoundingClientRect();
    return rect.top + rect.height / 2;
  }
  return listItem.getBoundingClientRect().top + 15;
}

/** 转弯线终点相对子项圆点中心的垂直偏移（负值上移，正值下移） */
const BULLET_LINE_END_OFFSET_Y = -1;

/** 对齐 Neo：按父子圆点实际位置计算转弯线高度，避免多行内容时仍用固定 26px */
function setConnectorMetrics(child, parent) {
  const childRect = child.getBoundingClientRect();
  const startY = bulletCenterY(parent);
  const endY = bulletCenterY(child) + BULLET_LINE_END_OFFSET_Y;
  child.style.setProperty("--li-bullet-line-top", `${startY - childRect.top}px`);
  child.style.setProperty("--li-bullet-line-height", `${Math.max(endY - startY, 0)}px`);
}

function runSelectionUpdate(clickTarget) {
  let start = clickTarget || null;
  if (!start) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    start = selection.getRangeAt(0).startContainer;
  }

  const { listItems, toMark, leafBlock, editor } = collectFocusPath(start);
  if (!editor || !leafBlock) return;

  if (lastEditor && lastEditor !== editor) clearFocus(lastEditor);
  lastEditor = editor;
  clearFocus(editor);

  let markLeaf = leafBlock;
  if (markLeaf.classList.contains("li") || markLeaf.dataset.type === "NodeListItem") {
    const content = [...markLeaf.children].find(
      (child) => child.dataset?.nodeId && !child.classList.contains("list")
    );
    if (content) markLeaf = content;
  }

  markLeaf.classList.add(FOCUS_CLASS);
  toMark.forEach((element) => element.classList.add(FOCUS_CLASS));

  const innerLi = listItems[0];
  if (innerLi && markLeaf.parentElement === innerLi) {
    innerLi.classList.add(FOCUS_SELF_CLASS);
  }

  for (let i = 0; i < listItems.length - 1; i++) {
    setConnectorMetrics(listItems[i], listItems[i + 1]);
  }
}

function scheduleUpdate(clickTarget) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runSelectionUpdate(clickTarget);
    debounceTimer = null;
  }, 50);
}

function onSelectionChange() {
  scheduleUpdate();
}

function onClick(event) {
  const target = event.composedPath()[0];
  if (!(target instanceof Element)) return;
  if (target.closest(".protyle-action")) {
    scheduleUpdate(target);
  }
}

function onPointerUp(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest(".protyle-wysiwyg")) return;
  scheduleUpdate(target);
}

export const initBulletThreading = () => {
  document.addEventListener("selectionchange", onSelectionChange);
  document.addEventListener("click", onClick, true);
  document.addEventListener("pointerup", onPointerUp, true);
  console.log("加载子弹线成功");
};
