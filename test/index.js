// dependencies
import Promise from 'bluebird';
import AsyncEmitter from 'carrack';
import assert from 'power-assert';

// target
import Plugin from '../src';

// fixture
class UserPlugin extends Plugin {
  static defaultOptions = {
    foo: 1,
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
  it('if first argument isnt EE, should throw an error', () => {
    const expectMessage = 'parent is not a defined';

    assert.throws(
      () => {
        const plugin = new UserPlugin;// eslint-disable-line no-unused-vars
      },
      (error) => {
        assert(error.message === expectMessage);
        return true;
      }
    );

    assert.throws(
      () => {
        const plugin = new UserPlugin({ on: 1 });// eslint-disable-line no-unused-vars
      },
      (error) => {
        assert(error.message === expectMessage);
        return true;
      }
    );
  });

  it('command argument value should be defined in opts.value', () => {
    // e.g. $ abby --plugin foor,bar,baz -> plugin.opts.value is 'foo,bar,baz'
    const emitter = new AsyncEmitter;
    const plugin = new UserPlugin(emitter, 'foo,bar,baz');

    assert(plugin.opts.value === 'foo,bar,baz');
  });

  it('default value for the plugin should be defined in the static defaultOptions property', () => {
    const emitter = new AsyncEmitter;
    const plugin = new UserPlugin(emitter);// eslint-disable-line no-unused-vars

    assert(plugin.opts.foo === 1);
  });

  it('should do pre-processing at the pluginWillAttach', () => {
    const emitter = new AsyncEmitter;
    const plugin = new UserPlugin(emitter);// eslint-disable-line no-unused-vars

    return emitter.emit('beforeImmediate')
    .then((values) => {
      assert(values[0] === 1);
    });
  });

  it('should do post-processing at the pluginWillDetach', () => {
    const emitter = new AsyncEmitter;
    const plugin = new UserPlugin(emitter);// eslint-disable-line no-unused-vars

    return emitter.emit('beforeExit', 1)
    .then((values) => {
      assert(values[0] === 2);
    });
  });
});
