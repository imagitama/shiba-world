export const cleanupTags = tags =>
  tags
    ? tags
        .filter(tag => /^[a-z_]+$/g.test(tag))
        .map(tag =>
          tag
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')
        )
    : []
