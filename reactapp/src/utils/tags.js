export const cleanupTags = tags =>
  tags
    ? tags
        .filter(tag => /^[a-z0-9_]+$/g.test(tag))
        .map(tag =>
          tag
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
        )
    : []
