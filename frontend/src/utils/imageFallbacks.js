const FEMALE_NAME_HINTS = [
  'sofia',
  'alma',
  'carla',
  'vera',
  'marta',
  'irene',
  'sara',
  'nadia',
  'lidia',
  'julia',
  'cloe',
  'elena',
  'paula',
  'lucia',
  'nora',
]

const CATEGORY_PORTRAIT_TAGS = {
  model: ['fashion', 'editorial', 'model', 'portrait', 'black and white'],
  photographer: ['fashion photographer', 'camera', 'portrait', 'monochrome'],
  'makeup artist': ['makeup artist', 'beauty portrait', 'editorial', 'monochrome'],
  'tattoo artist': ['tattoo artist', 'portrait', 'studio', 'black and white'],
  'creative director': ['creative director', 'fashion portrait', 'editorial', 'monochrome'],
  stylist: ['fashion stylist', 'portrait', 'editorial', 'black and white'],
}

const CATEGORY_COVER_TAGS = {
  model: ['fashion campaign', 'editorial set', 'monochrome'],
  photographer: ['fashion set', 'studio lights', 'monochrome'],
  'makeup artist': ['beauty editorial', 'makeup set', 'black and white'],
  'tattoo artist': ['tattoo studio', 'editorial portrait', 'monochrome'],
  'creative director': ['art direction', 'fashion campaign', 'black and white'],
  stylist: ['styling set', 'wardrobe', 'monochrome'],
}

const CATEGORY_PORTFOLIO_TAGS = {
  model: ['fashion editorial', 'model portrait', 'black and white'],
  photographer: ['fashion photography', 'studio portrait', 'monochrome'],
  'makeup artist': ['beauty close up', 'editorial makeup', 'black and white'],
  'tattoo artist': ['tattoo close up', 'fine line', 'monochrome'],
  'creative director': ['campaign concept', 'art direction', 'black and white'],
  stylist: ['lookbook styling', 'fashion wardrobe', 'monochrome'],
}

const normalizeText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const toTag = (value) => normalizeText(value).replace(/\s+/g, '-')

const unique = (items) => [...new Set(items)]

const buildQuery = (tags) => unique(tags.map(toTag).filter(Boolean)).join(',')

const buildSeed = (...parts) => {
  const source = parts.filter(Boolean).join('|')
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash) % 900000 + 1000
}

const buildUnsplashSource = (width, height, query, seed) =>
  `https://source.unsplash.com/${width}x${height}/?${query}&sig=${seed}`

const inferGenderTags = (talent) => {
  const stageName = normalizeText(talent?.stage_name ?? talent?.name)
  const isFemale = FEMALE_NAME_HINTS.some((hint) => stageName.includes(hint))

  return isFemale ? ['woman', 'female'] : ['man', 'male']
}

const resolveCategoryKey = (talent) => normalizeText(talent?.category)

const isProblematicImageSource = (url) => {
  const value = String(url ?? '').toLowerCase()
  return value.includes('loremflickr.com') || value.includes('lorempicsum')
}

export const FALLBACK_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1800&q=80',
  portrait: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1200&q=80&sat=-100',
  cover: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80&sat=-100',
  square: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80&sat=-100',
}

export const buildTalentPortraitFallback = (talent) => {
  const categoryKey = resolveCategoryKey(talent)
  const categoryTags = CATEGORY_PORTRAIT_TAGS[categoryKey] ?? ['fashion', 'editorial', 'portrait', 'black and white']
  const genderTags = inferGenderTags(talent)
  const query = buildQuery([...categoryTags, ...genderTags])
  const seed = buildSeed('portrait', talent?.id, talent?.stage_name, categoryKey)

  return buildUnsplashSource(1200, 1600, query, seed)
}

export const buildTalentCoverFallback = (talent) => {
  const categoryKey = resolveCategoryKey(talent)
  const categoryTags = CATEGORY_COVER_TAGS[categoryKey] ?? ['fashion campaign', 'editorial set', 'black and white']
  const genderTags = inferGenderTags(talent)
  const query = buildQuery([...categoryTags, ...genderTags])
  const seed = buildSeed('cover', talent?.id, talent?.stage_name, categoryKey)

  return buildUnsplashSource(1600, 900, query, seed)
}

export const buildTalentPortfolioFallback = (talent, item) => {
  const categoryKey = resolveCategoryKey(talent)
  const categoryTags = CATEGORY_PORTFOLIO_TAGS[categoryKey] ?? ['fashion', 'editorial', 'portfolio', 'black and white']
  const genderTags = inferGenderTags(talent)
  const query = buildQuery([...categoryTags, ...genderTags])
  const seed = buildSeed('portfolio', talent?.id, item?.id, item?.sort_order, categoryKey)

  return buildUnsplashSource(1200, 1200, query, seed)
}

export const resolveTalentPortraitSource = (talent) => {
  if (talent?.profile_image && !isProblematicImageSource(talent.profile_image)) {
    return talent.profile_image
  }

  return buildTalentPortraitFallback(talent)
}

export const resolveTalentCoverSource = (talent) => {
  const source = talent?.cover_image || talent?.profile_image

  if (source && !isProblematicImageSource(source)) {
    return source
  }

  return buildTalentCoverFallback(talent)
}

export const resolveTalentPortfolioSource = (talent, item) => {
  if (item?.image_url && !isProblematicImageSource(item.image_url)) {
    return item.image_url
  }

  return buildTalentPortfolioFallback(talent, item)
}

export const applyFallback = (event, fallbackUrl) => {
  const target = event.currentTarget

  if (target && target.src !== fallbackUrl) {
    target.src = fallbackUrl
  }
}
