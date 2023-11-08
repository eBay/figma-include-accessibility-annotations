/* eslint-disable-next-line */
const stylelint = require('stylelint');

// pulled from
// https://medium.com/swlh/writing-your-first-custom-stylelint-rule-a9620bb2fb73
const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = 'custom-rules/hex-lowercase';

const messages = ruleMessages(ruleName, {
  expected: (unfixed, fixed) => `Expected "${unfixed}" to be "${fixed}"`
});

module.exports = stylelint.createPlugin(
  ruleName,
  (primaryOption, secondaryOptionObject, context) =>
    function lint(postcssRoot, postcssResult) {
      const validOptions = validateOptions(postcssResult, ruleName, {
        // no options for now...
      });

      if (!validOptions) {
        return;
      }

      const isAutoFixing = Boolean(context.fix);
      postcssRoot.walkDecls((decl) => {
        const hasCapitalLetters =
          /^#([A-F0-9]{6}|[A-F0-9]{3})$/.test(decl.value) &&
          /[A-Z]/.test(decl.value);

        if (!hasCapitalLetters) {
          return;
        }

        const { value } = decl;
        const newValue = value.toLowerCase();

        if (isAutoFixing) {
          if (decl.raws.value) {
            decl.raws.value.raw = newValue;
          } else {
            decl.value = newValue;
          }
        } else {
          report({
            ruleName,
            result: postcssResult,
            message: messages.expected(value, newValue),
            node: decl,
            word: value
          });
        }
      });
    }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;
