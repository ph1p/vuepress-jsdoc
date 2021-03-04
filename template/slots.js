module.exports = {
	slots: function slots(
  slots,
  opt) {
  const slotNames = Object.keys(slots)
  if (!slotNames.length) {
    return '' // if no slots avoid creating the section
  }
  return `
## Slots

  | Name xx          | Description  | Bindings |
  | ------------- | ------------ | -------- |
${slotNames
  .map(slotName => {
    const { description, bindings } = slots[slotName]
    const readableBindings = // serialize bindings to display them ina readable manner
      bindings && Object.keys(bindings).length
        ? JSON.stringify(bindings, null, 2)
        : ''
    return `| xxx ${slotName} | ${description} | ${readableBindings} |<br>`
  })
  .join('\n')}
  `
}

}