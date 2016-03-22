import paramCase from 'param-case';

export default class Plugin {
  /**
  * @static
  * @property defaultOptions
  */
  static defaultOptions = {};

  /**
  * @constructor
  * @param {AsyncEmitter} parent - the abigail instance
  * @param {string|number} value - a plugin command line argument value(ignore the boolean)
  * @param {object} [options={}] - passed from package.json `abigail>plugins` field
  */
  constructor(parent, value = true, options = {}) {
    if (typeof parent !== 'object' || typeof parent.on !== 'function') {
      throw new TypeError('parent is not a defined');
    }

    this.name = paramCase(this.constructor.name);
    this.parent = parent;
    this.opts = Object.assign(
      {},
      { process },
      this.constructor.defaultOptions,
      options,
      typeof value !== 'boolean' ? { value } : {},
    );

    this._pluginWillAttach = (...args) => this.pluginWillAttach(...args);
    this._pluginWillDetach = (...args) => this.pluginWillDetach(...args);
    this.parent.once('attach-plugins', this._pluginWillAttach);
    this.parent.once('detach-plugins', this._pluginWillDetach);
  }

  /**
  * @method getPlugin
  * @param {string} name - a param-cased constructor.name
  * @returns {Plugin} instance - the plugin instance
  */
  getPlugin(name) {
    for (const key in this.parent.plugins || {}) {
      if (key === name) {
        return this.parent.plugins[key];
      }
    }

    throw new Error(`no plugins found: ${name}`);
  }

  /**
  * @method abort
  * @returns {undefined}
  */
  abort() {
    this.parent.removeListener('attach-plugins', this._pluginWillAttach);
    this.parent.removeListener('detach-plugins', this._pluginWillDetach);
  }

  /**
  * @method pluginWillAttach
  * @returns {undefined}
  */
  pluginWillAttach() {}

  /**
  * @method pluginWillDetach
  * @param {number} [exitCode=null] - process exit code
  * @returns {undefined}
  */
  pluginWillDetach() {}
}
