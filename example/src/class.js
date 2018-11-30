/*
 * @vuepress
 * ---
 * title: test class
 * ---
 */
/**
 * This is a test class
 *
 * @class Test
 */
class Test {
  /**
   * Creates an instance of Test.
   * @param {string} [name='Peter']
   * @memberof Test
   */
  constructor(name = 'Peter') {
    this.name = name;
    this.isActive = isActive;
  }

  /**
   * Set current name
   *
   * @memberof Test
   */
  set name(name) {
    this.name = name;
  }

  /**
   * Get current name
   *
   * @memberof Test
   */
  get name() {
    return this.name;
  }

  /**
   * Generate a fullname
   *
   * @returns an string
   * @memberof Test
   */
  generateFullName() {
    return `${this.name} Mustermann`;
  }
}

export default Test;
