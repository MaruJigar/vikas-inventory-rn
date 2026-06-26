module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NOTE: Do NOT re-add `@babel/plugin-transform-class-properties` with
      // `{ loose: true }`. Loose mode compiles class fields to plain
      // assignments (`this.x = ...`, i.e. [[Set]]) instead of
      // Object.defineProperty ([[Define]]). React Native's DOM `Event`
      // polyfill declares `NONE`/`CAPTURING_PHASE`/etc. as class fields while
      // also defining them as read-only props on `Event.prototype`; under
      // loose mode the field init assigns through the prototype and Hermes
      // throws "Cannot assign to read-only property 'NONE'". Expo SDK 54's
      // babel-preset-expo already transforms class properties + #private
      // methods with correct (define) semantics, so no manual plugins needed.
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
