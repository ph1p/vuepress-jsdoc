const kebabCase = require('lodash').kebabCase;

module.exports = {
  props: function props(props, opt) {
    const propNames = Object.keys(props);
    if (!propNames.length) {
      return ""; // if no props avoid creating the section
    }
    return `
## Props

  | Prop name  | Description  | Type  | Values | Default | Required |
  | ---------- | ------------ | ----- | ------ | ------- | -------- |
${propNames
  .map((propName) => {
    const { name, description, type, values, defaultValue, tags } = props[
      propName
    ];

    const containsProps = tags && Object.keys(tags).length ? true : false;
    var ignoreProps = false;
    if (containsProps) {
      if ("ignore" in tags) {
        ignoreProps = true;
      }
    }

    if (!ignoreProps) {
      var functionType = false;

      var vueType = false;

      var vueTypeValidatorName = "";

      const vueTypeNativeValidators = [
        "any",
        "array",
        "bool",
        "func",
        "number",
        "integer",
        "object",
        "string",
        "symbol",
      ];

      const vueTypeCustomValidators = [
        "instanceOf",
        "oneOf",
        "oneOfType",
        "arrayOf",
        "objectOf",
        "shape",
        "custom",
      ];

      var vueTypeNativeValidator = false;
      var vueTypeCustomValidator = false;

      var vueTypeValidatorContainsModifiers = false;

      var vueTypeValidatorContainsFlag = false;
      var vueTypeValidatorFlag = ""; // .isRequired, loose
      var vueTypeIsRequired = false;

      var vueTypeDefaultSet = false; // .def(any)
      var vueTypeDefault = "";

      var vueTypeNativeCustomValidatorSet = false; // .validate(function)
      var vueTypeNativeCustomValidator = "";

      var vueTypeDefaultFlagType = false; // Remove?

      if (type && type.func) {
        functionType = true;

        vueType = type.name.includes("VueType");

        if (vueType) {
          var explodedVueTypeExpression = type.name.split(".");
          vueTypeValidatorName = explodedVueTypeExpression[1];

          // Check if native or custom Validator
          if (vueTypeNativeValidators.includes(vueTypeValidatorName)) {
            vueTypeNativeValidator = true;
          } else if (vueTypeCustomValidators.includes(vueTypeValidatorName)) {
            vueTypeCustomValidator = true;
          }

          // Check if expression contains one or more VueType-modifiers
          if (explodedVueTypeExpression.length > 2) {
            vueTypeValidatorContainsModifiers = true;

            // Go through all modifiers and check for def(any)
            defIndex = explodedVueTypeExpression.indexOf("def");
            if (defIndex >= 0) {
              vueTypeValidatorContainsFlag = true;
              vueTypeValidatorFlag = "def";
              vueTypeDefaultSet = true;
              vueTypeDefaultFlagType = true;
              var defModifer = explodedVueTypeExpression[defIndex];

              var leftParenthesis = defModifer.indexOf("(");
              var rightParenthesis = defModifer.indexOf(")");
              vueTypeDefault = defModifer.substring(
                leftParenthesis + 1,
                rightParenthesis
              );
            }
          }

          // Check for VueType Validator type
          if (vueTypeValidatorName.includes("(")) {
            vueTypeCustomValidator = true;
          } else {
            vueTypeNativeValidator = true;
          }

          if (vueTypeCustomValidator) {
            var leftParenthesis = vueTypeValidatorName.indexOf("(");
            var rightParenthesis = vueTypeValidatorName.indexOf(")");
            vueTypeValidatorName = vueTypeValidatorName.substring(
              leftParenthesis + 1,
              rightParenthesis
            );
          }
        }
      }

      var readableDescription = description ? description : "";

      var readableValues = // serialize values to display them in a readable manner
        values && Object.keys(values).length ? JSON.stringify(values) : "";

      var readableDefaultValue = defaultValue // serialize values to display them in a readable manner
        ? JSON.stringify(defaultValue)
        : "";

      if (vueTypeDefaultFlagType) {
        readableDefaultValue = vueTypeDefaultFlag;
      }

      var readableTags = // serialize values to display them in a readable manner
        tags && Object.keys(tags).length ? JSON.stringify(tags) : "";

      return `| ${kebabCase(name) + isVueType()} | ${readableDescription} | ${
        vueType ? vueTypeValidatorName : type.name
      } | ${readableValues} | ${readableDefaultValue} | ${vueTypeValidatorFlag} |<br>`;
    } else {
      return "";
    }
  })
  .join("\n")}
  `;
  },
};

const vueTypes = {
  native : "native",
  custom: "custom"
}

const vueTypeNativeValidators = [
  {"validator": "any", "type": vueTypes.native},
  {"validator": "array", "type": vueTypes.native},
  {"validator": "bool", "type": vueTypes.native},
  {"validator": "func", "type": vueTypes.native},
  {"validator": "number", "type": vueTypes.native},
  {"validator": "integer", "type": vueTypes.native},
  {"validator": "object", "type": vueTypes.native},
  {"validator": "string", "type": vueTypes.native},
  {"validator": "symbol", "type": vueTypes.native},
  {"validator": "instanceOf", "type": vueTypes.custom},
  {"validator": "oneOf", "type": vueTypes.custom},
  {"validator": "oneOfType", "type": vueTypes.custom},
  {"validator": "arrayOf", "type": vueTypes.custom},
  {"validator": "objectOf", "type": vueTypes.custom},
  {"validator": "shape", "type": vueTypes.custom},
  {"validator": "custom", "type": vueTypes.custom},
];

function isVueType(type) {
  var isVueType = false;

  if (typeof type != "undefined" && type && type.length >= 0) {
    isVueType = vueTypeNativeValidators.some(vueType => vueType.validator === type[0]);
  }
  
  return isvueType;
}
