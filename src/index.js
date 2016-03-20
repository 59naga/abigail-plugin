import defaultsDeep from 'lodash.defaultsdeep';

export default class Plugin {
  /**
  * @static
  * @property defaultOptions
  */
  static defaultOptions = {};

  /**
  * @constructor
  * @param {Abigail} parent - the abigail instance
  * @param {options} [options]
  */
  constructor(parent, options = {}) {
    if (typeof parent !== 'object' || typeof parent.on !== 'function') {
      throw new TypeError('parent is not a defined');
    }

    this.parent = parent;
    this.opts = defaultsDeep(
      {},
      typeof options !== 'boolean' ? {value: options}: {},
      this.constructor.defaultOptions,
      { process },
    );

    this.parent.on('beforeImmediate', () => this.pluginWillAttach());
    this.parent.on('beforeExit', (exitCode) => this.pluginWillDetach(exitCode));
  }

  /**
  * @method pluginWillAttach
  * @returns {undefined}
  */
  pluginWillAttach() {}

  /**
  * @method pluginWillDetach
  * @returns {undefined}
  */
  pluginWillDetach() {}
}
