const vueDocs = require('vue-docgen-api');

function paramsString(params) {
  return params.map(param => `${param.name}: \`${param.type.name}\``).join(',');
}

function generateTags(tags) {
  let tagsContent = '::: tip Tags\n';

  tagsContent += Object.keys(tags)
    .map(key => tags[key].map(tag => `**${tag.title}**: ${tag.description}<br />`).join(''))
    .join('');

  return tagsContent + '\n:::\n';
}

function fileContent() {
  let contentArray = [];
  let line = 0;

  return {
    get content() {
      return contentArray.join('\n');
    },
    addline(content) {
      contentArray[line] = content;
      line++;
    }
  };
}

module.exports = async path => {
  const file = fileContent();

  try {
    const data = await vueDocs.parse(path);

    file.addline(`# ${data.displayName}\n${data.description}\n`);

    // Tags
    if (data.tags) {
      file.addline(generateTags(data.tags) + '\n');
    }

    file.addline('## Table of contents\n[[toc]]\n');

    // Props
    if (data.props) {
      const props = data.props;
      let propsContent = '## Props\n\n';

      props.forEach(prop => {
        propsContent += `### ${prop.name} (\`${prop.type.name}\`)\n`;

        // Tags
        if (Object.keys(prop.tags).length) {
          propsContent += generateTags(prop.tags);
        }

        propsContent += '\n\n|type|default|description|\n|:-|:-|:-|:-|\n';
        propsContent += `|\`${prop.type.name}\`|${prop.defaultValue ? prop.defaultValue.value : '-'}|${
          prop.description
        }`;

        propsContent += '|\n';
      });

      file.addline(propsContent + '\n');
    }

    //Methods
    if (data.methods) {
      const methods = data.methods;
      file.addline('## Methods\n');

      methods.forEach(method => {
        file.addline(
          `### ${method.name} (${paramsString(method.params)}) -> \`${method.returns.type.name}\`\n ${
            method.description
          }\n`
        );

        // Tags
        if (Object.keys(method.tags).length) {
          file.addline(generateTags(method.tags));
        }

        // params
        if (method.params) {
          file.addline(
            `#### Params\n| name | type | description\n|:-|:-|:-|\n` +
              method.params.map(param => `|${param.name}|\`${param.type.name}\`|${param.description}`).join('\n')
          );
        }

        // returns
        file.addline(`\n#### returns (${method.returns.type.name})\n ${method.returns.description}`);
      });
    }

    // Slots
    if (data.slots) {
      const slots = data.slots;
      file.addline(
        `## Slots\n| name | description\n|:-|:-|:-|\n ${slots
          .map(slot => `|**${slot.name}**|${slot.description}|`)
          .join('\n')}\n\n`
      );
    }

    // Events
    if (data.events) {
      const events = data.events;
      let eventsContent = '## Events\n\n';

      events.forEach(event => {
        eventsContent += `### ${event.name} (${event.type.names.join(',')})\n\n${event.description}\n`;

        // properties
        if (event.properties) {
          eventsContent += `#### Properties\n| name | type | description\n|:-|:-|:-|\n${event.properties
            .map(property => `|${property.name}|\`${property.type.names.join(',')}\`|${property.description}`)
            .join('\n')}`;
        }
      });

      file.addline(eventsContent + '\n\n');
    }

    return Promise.resolve(file.content);
  } catch (err) {
    return Promise.reject(err);
  }
};
