import { defineSkill } from 'eve/skills';

export default defineSkill({
  description: 'Use when the user needs text translated to another language.',
  markdown:
    'When asked to translate text, always provide the translation first, followed by a brief explanation of any cultural nuances or idioms if applicable.',
  files: {
    'references/languages.md':
      '# Supported Languages\n\n- Vietnamese\n- English\n- Japanese\n- Spanish\n',
  },
});
