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

module.exports = async path => {
  try {
    const data = await vueDocs.parse(path);

    let markdown = [`# ${data.displayName}\n`, `${data.description}\n`];
    let line = markdown.length;

    // Tags
    if (data.tags) {
      markdown[line] = generateTags(data.tags) + '\n';
      line++;
    }

    markdown[line] = '## Table of contents\n[[toc]]\n';
    line++;

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

      markdown[line] = propsContent + '\n';
      line++;
    }

    //Methods
    if (data.methods) {
      const methods = data.methods;
      markdown[line] = '## Methods\n';
      line++;

      methods.forEach(method => {
        markdown[line] = `### ${method.name} (${paramsString(method.params)}) -> \`${method.returns.type.name}\`\n ${
          method.description
        }\n`;
        line++;

        // Tags
        if (Object.keys(method.tags).length) {
          markdown[line] = generateTags(method.tags);
          line++;
        }

        // params
        if (method.params) {
          markdown[line] =
            `#### Params\n| name | type | description\n|:-|:-|:-|\n` +
            method.params.map(param => `|${param.name}|\`${param.type.name}\`|${param.description}`).join('\n');
          line++;
        }

        // returns
        markdown[line] = `\n#### returns (${method.returns.type.name})\n ${method.returns.description}`;
      });
    }

    // Slots
    if (data.slots) {
      const slots = data.slots;
      markdown[line] = `## Slots\n| name | description\n|:-|:-|:-|\n ${slots
        .map(slot => `|**${slot.name}**|${slot.description}|`)
        .join('\n')}\n\n`;
      line++;
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

      markdown[line] = eventsContent + '\n\n';
      line++;
    }

    return Promise.resolve(markdown.join('\n'));
  } catch (err) {
    return Promise.reject(err);
  }
};
