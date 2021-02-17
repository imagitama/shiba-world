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

export const popularTagsByCategory = {
  Cost: ['paid', 'free', 'patreon_only', 'gumroad', 'addon'],

  Compatibility: [
    'wip',
    'quest',
    'quest_only',
    'pc_only',
    'low_poly',
    'sdk2',
    'sdk3',
    'not_vrchat_compatible'
  ],

  Features: [
    'sdk3_puppets',
    'full_body_ready',
    'dynamic_bones',
    'hand_colliders',
    'nsfw_included',
    'blend_shapes',
    'scene_included',
    'blendfile_included',
    'fbx_included',
    'unity_package',
    'prefabs_included',
    'toggle_accessories',
    'customizable_body'
  ],

  Textures: [
    'textures_included',
    'uv_included',
    'psd_included',
    'original_texture_included',
    'substance_painter_included',
    'high_resolution_textures',
    'xsfur_shader',
    'poiyomi_toon_shader',
    'cubed_toon_shader',
    'vilar_eye_shader',
    'xiexe_shader',
    'multiple_textures',
    'custom_shaders',
    'multiple_eye_colors'
  ],

  Appearance: [
    'plantigrade',
    'digigrade',
    'cartoony',
    'very_realistic',
    'beans',
    'claws',
    'horns',
    'wings',
    'big_ears',
    'tail',
    'fluffy',
    'glasses',
    'female',
    'male',
    'furry',
    'feathers',
    'paws',
    'beak',
    'scales',
    'whiskers'
  ],

  Clothing: ['collar', 'clothes', 'tshirt', 'jeans', 'bandana', 'ring'],

  Animation: [
    'custom_animations',
    'custom_idle_animation',
    'custom_emotes',
    'custom_gestures'
  ],

  Other: [
    'remodel',
    'depends_on_shiba',
    'discord_server_support',
    'neosvr_compatible',
    'chilloutvr_compatible'
  ]
}
