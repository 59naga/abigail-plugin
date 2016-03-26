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
      throw new TypeError('parent is not a asyncemitter');
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
    this.unsubscribes = [];

    this.subscribe('attach-plugins', (...args) => this.pluginWillAttach(...args), true);
    this.subscribe('detach-plugins', (...args) => this.pluginWillDetach(...args), true);
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
  * @method subscribe
  * @param {string} event - a listen event name
  * @param {function} listener - a listener
  * @param {boolean} [once=false] - if true, listen only once
  * @returns {function} unsubscribe - removeListener shortcut function
  */
  subscribe(event, listener, once = false) {
    const unsubscribe = () => this.parent.removeListener(event, listener);

    if (once) {
      this.parent.once(event, listener);
    } else {
      this.parent.on(event, listener);
    }
    this.unsubscribes.push(unsubscribe);

    return unsubscribe;
  }

  /**
  * @method abort
  * @returns {undefined}
  */
  abort() {
    this.unsubscribes.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribes = [];
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
