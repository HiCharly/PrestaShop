require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

module.exports = class moduleManager extends BOBasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'Module manager •';

    // Selectors
    this.searchModuleTagInput = '#search-input-group input.pstaggerAddTagInput';
    this.searchModuleButton = '#module-search-button';
    this.modulesListBlock = '.module-short-list:not([style=\'display: none;\'])';
    this.modulesListBlockTitle = `${this.modulesListBlock} span.module-search-result-title`;
    this.allModulesBlock = `${this.modulesListBlock} .module-item-list`;
    this.moduleBlock = moduleName => `${this.allModulesBlock}[data-name='${moduleName}']`;
    this.disableModuleButton = moduleName => `${this.moduleBlock(moduleName)} button.module_action_menu_disable`;
    this.configureModuleButton = moduleName => `${this.moduleBlock(moduleName)}`
      + ' div.module-actions a[href*=\'/action/configure\']';
    this.actionsDropdownButton = moduleName => `${this.moduleBlock(moduleName)} button.dropdown-toggle`;
    // Status dropdown selectors
    this.statusDropdownDiv = '#module-status-dropdown';
    this.statusDropdownMenu = 'div.ps-dropdown-menu[aria-labelledby=\'module-status-dropdown\']';
    this.statusDropdownItemLink = ref => `${this.statusDropdownMenu} ul li[data-status-ref='${ref}'] a`;
    // Categories
    this.categoriesSelectDiv = '#categories';
    this.categoriesDropdownDiv = 'div.ps-dropdown-menu.dropdown-menu.module-category-selector';
    this.categoryDropdownItem = cat => `${this.categoriesDropdownDiv} li[data-category-display-name='${cat}']`;
  }

  /*
  Methods
   */

  /**
   * Search Module in Page module Catalog
   * @param moduleTag, Tag of Module
   * @param moduleName, Name of module
   * @return {Promise<void>}
   */
  async searchModule(moduleTag, moduleName) {
    await this.page.type(this.searchModuleTagInput, moduleTag);
    await this.page.click(this.searchModuleButton);
    await this.waitForVisibleSelector(this.moduleBlock(moduleName));
  }

  /**
   * Click on button configure of a module
   * @param moduleName, Name of module
   * @return {Promise<void>}
   */
  async goToConfigurationPage(moduleName) {
    if(await this.elementNotVisible(this.configureModuleButton(moduleName), 1000)) {
      await Promise.all([
        this.page.click(this.actionsDropdownButton(moduleName)),
        this.waitForVisibleSelector(`${this.actionsDropdownButton(moduleName)}[aria-expanded='true']`),
      ]);
    }
    await this.page.click(this.configureModuleButton(moduleName));
  }

  /**
   * Filter modules by status
   * @param enabled
   * @return {Promise<void>}
   */
  async filterByStatus(enabled) {
    await Promise.all([
      this.page.click(this.statusDropdownDiv),
      this.waitForVisibleSelector(`${this.statusDropdownDiv}[aria-expanded='true']`),
    ]);
    await Promise.all([
      this.page.click(this.statusDropdownItemLink(enabled ? 1 : 0)),
      this.waitForVisibleSelector(`${this.statusDropdownDiv}[aria-expanded='false']`),
    ]);
  }

  /**
   * Get status of module (enable/disable)
   * @param moduleName
   * @return {Promise<boolean|true>}
   */
  async isModuleEnabled(moduleName) {
    return this.elementNotVisible(this.disableModuleButton(moduleName), 1000);
  }

  /**
   * Get all modules status
   * @return {Promise<void>}
   */
  async getAllModulesStatus() {
    const modulesStatus = [];
    const allModulesNames = await this.getAllModulesNames();
    for (let i = 0; i < allModulesNames.length; i++) {
      const moduleStatus = await this.isModuleEnabled();
      await modulesStatus.push({name: allModulesNames[i], status: moduleStatus});
    }
    return modulesStatus;
  }

  /**
   * Get All modules names
   * @return {Promise<table>}
   */
  async getAllModulesNames() {
    return this.page.$$eval(
      this.allModulesBlock,
      all => all.map(el => el.getAttribute('data-name')),
    );
  }

  /**
   * Filter by category
   * @param category
   * @return {Promise<void>}
   */
  async filterByCategory(category) {
    await Promise.all([
      this.page.click(this.categoriesSelectDiv),
      this.waitForVisibleSelector(`${this.categoriesSelectDiv}[aria-expanded='true']`),
    ]);
    await Promise.all([
      this.page.click(this.categoryDropdownItem(category)),
      this.waitForVisibleSelector(`${this.categoriesSelectDiv}[aria-expanded='false']`),
    ]);
  }

  /**
   * Get modules block title (administration / payment ...)
   * @param position
   * @return {Promise<void>}
   */
  async getBlockModuleTitle(position) {
    const modulesBlocks = await this.page.$$eval(this.modulesListBlockTitle, all => all.map(el => el.textContent));
    return modulesBlocks[position - 1];
  }
};
