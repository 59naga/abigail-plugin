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

    this.subscribe('initialized', () => this.pluginDidInitialize(), true);
    this.subscribe('attach-plugins', () => this.pluginWillAttach(), true);
    this.subscribe('detach-plugins', () => this.pluginWillDetach(), true);
  }

  /**
  * @method getPlugin
  * @param {string} name - a param-cased constructor.name
  * @returns {Plugin} instance - the plugin instance
  */
  getPlugin(name) {
    const plugins = this.getProps().plugins || {};
    for (const key in plugins) {
      if (key === name) {
        return plugins[key];
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
    const unsubscribe = this.parent.subscribe(event, listener, once);

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
  * @method setProps
  * @param {object} [newProps={}]
  * @returns {undefined}
  */
  setProps(newProps = {}) {
    this.parent.props = Object.assign(
      {},
      this.parent.props || {},
      newProps,
    );
  }

  /**
  * @method getProps
  * @returns {object} props
  */
  getProps() {
    return Object.assign(
      {},
      this.parent.props || {},
    );
  }

  /**
  * execute only once before the parse
  * the plugin lifecycle method of plugin via `initialized`
  *
  * @method pluginDidInitialize
  * @returns {undefined}
  */
  pluginDidInitialize() {}

  /**
  * execute only once before the launch
  * the plugin lifecycle method of plugin via `attach-plugins`
  *
  * @method pluginWillAttach
  * @returns {undefined}
  */
  pluginWillAttach() {}

  /**
  * execute only once before the exit
  * the plugin lifecycle method via `detach-plugins`
  *
  * @method pluginWillDetach
  * @param {number} [exitCode=null] - process exit code
  * @returns {undefined}
  */
  pluginWillDetach() {}
}
