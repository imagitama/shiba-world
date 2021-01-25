export const cleanupTags = tags =>
  tags
    ? tags
        .filter(tag => /^[a-zA-Z\_]+$/g.test(tag))
        .map(tag =>
          tag
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
        )
    : []
