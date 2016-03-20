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
  * @param {object} [options={}] - passed from package.json `abigail>plugin` field
  */
  constructor(parent, value = true, options = {}) {
    if (typeof parent !== 'object' || typeof parent.on !== 'function') {
      throw new TypeError('parent is not a defined');
    }

    this.parent = parent;
    this.opts = Object.assign(
      {},
      { process },
      this.constructor.defaultOptions,
      options,
      typeof value !== 'boolean' ? { value } : {},
    );

    this.parent.once('beforeImmediate', (...args) => this.pluginWillAttach(...args));
    this.parent.once('beforeExit', (...args) => this.pluginWillDetach(...args));
  }

  /**
  * @method pluginWillAttach
  * @returns {undefined}
  */
  pluginWillAttach() {}

  /**
  * @method pluginWillDetach
  * @param {number} exitCode - process exit code
  * @returns {undefined}
  */
  pluginWillDetach() {}
}
