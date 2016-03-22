// dependencies
import Promise from 'bluebird';
import AsyncEmitter from 'carrack';
import assert from 'power-assert';

// target
import Plugin from '../src';

// fixture
class UserPlugin extends Plugin {
  static defaultOptions = {
    foo: [1],
    value: 2,
  }

  pluginWillAttach() {
    return new Promise((resolve) => {
      resolve(1);
    });
  }
  pluginWillDetach(exitCode) {
    return new Promise((resolve) => {
      resolve(exitCode + 1);
    });
  }
}

// specs
describe('Plugin', () => {
  describe('plugin lifecycle', () => {
    it('should do pre-processing at the attach-plugins event', () => {
      const emitter = new AsyncEmitter;
      const plugin = new UserPlugin(emitter);

      return emitter.emit('attach-plugins')
      .then((values) => {
        assert(values[0] === 1);
      });
    });

    it('should do post-processing at the detach-plugins event', () => {
      const emitter = new AsyncEmitter;
      const plugin = new UserPlugin(emitter);

      return emitter.emit('detach-plugins', 1)
      .then((values) => {
        assert(values[0] === 2);
      });
    });

    it('if run the abort, it should instantly suspend dependence on parent', () => {
      const emitter = new AsyncEmitter;
      const plugin = new UserPlugin(emitter);
      plugin.abort();

      return emitter.emit('attach-plugins')
      .then((values) => {
        assert(values[0] === undefined);

        return emitter.emit('detach-plugins', 1);
      })
      .then((values) => {
        assert(values[0] === undefined);
      });
    });
  });

  describe('constructor', () => {
    it('if first argument isnt EE, should throw an error', () => {
      const expectMessage = 'parent is not a defined';

      assert.throws(
        () => {
          const plugin = new UserPlugin;
        },
        (error) => {
          assert(error.message === expectMessage);
          return true;
        }
      );

      assert.throws(
        () => {
          const plugin = new UserPlugin({ on: 1 });
        },
        (error) => {
          assert(error.message === expectMessage);
          return true;
        }
      );
    });

    it('should define the param-case phased constructor.name to instance.name', () => {
      const emitter = new AsyncEmitter;
      const plugin = new UserPlugin(emitter);

      assert(plugin.name === 'user-plugin');
    });

    it('command argument value should be defined in opts.value unless boolean', () => {
      let plugin;
      // e.g. $ abby --plugin foor,bar,baz -> plugin.opts.value is 'foo,bar,baz'
      const emitter = new AsyncEmitter;
      plugin = new UserPlugin(emitter, 'foo,bar,baz');
      assert(plugin.opts.value === 'foo,bar,baz');

      plugin = new UserPlugin(emitter, 1);
      assert(plugin.opts.value === 1);
    });

    it('default value for the plugin should be defined in the static defaultOptions property', () => {
      let plugin;

      const emitter = new AsyncEmitter;
      plugin = new UserPlugin(emitter);
      assert(plugin.opts.foo[0] === 1);

      plugin = new UserPlugin(emitter, null, { foo: 2 });
      assert(plugin.opts.foo === 2);
    });
  });

  describe('::getPlugin', () => {
    it('should return the matching plugin name reference', () => {
      const emitter = new AsyncEmitter;
      emitter.plugins = { other: 1 };
      const plugin = new UserPlugin(emitter);
      const ref = plugin.getPlugin('other');

      assert(ref === 1);
    });
  });
});
