/**
 * Object description
 */
const obj = {
  /**
   * name
   */
  name: 'Luisa',

  /**
   * A function with a parameter and returns the name
   *
   * @param {any} parameter
   * @returns this.name
   */
  objMethod(parameter) {
    return this.name;
  },

  /**
   * Old way to write methods in objects
   */
  objMethodTwo: function() {
    return 'something';
  }
};
