// ========================================
// my_theme 主题初始化入口
// ========================================

import { initThemeMode } from './modules/themeMode.js';
import { initBulletThreading } from './modules/bulletThreading.js';
import { initTopbar } from './modules/topbar.js';
import { initAutoUnfoldList } from './modules/autoUnfoldList.js';
import { initMiddleClickCollapse } from './modules/middleClickCollapse.js';
import { initListPreview } from './modules/listPreview.js';
import { initViewSelect } from './modules/viewSelect.js';

export const initAll = async () => {
  initThemeMode();
  initBulletThreading();
  initTopbar();
  initAutoUnfoldList();
  initMiddleClickCollapse();
  initListPreview();
  initViewSelect();
};

export {
  initThemeMode,
  initBulletThreading,
  initTopbar,
  initAutoUnfoldList,
  initMiddleClickCollapse,
  initListPreview,
  initViewSelect
};
