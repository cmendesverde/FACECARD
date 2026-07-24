// Pool de imágenes locales (servidas por el frontend en /public/media/placeholders).
// Fuente única y estable: sin dependencia de servicios externos de imágenes.
const PLACEHOLDER_POOL = [
  '/media/placeholders/portrait-1.jpg',
  '/media/placeholders/portrait-2.jpg',
  '/media/placeholders/portrait-3.jpg',
  '/media/placeholders/portrait-4.jpg',
  '/media/placeholders/portrait-5.jpg',
  '/media/placeholders/portrait-6.jpg',
]

const buildSeed = (...parts) => {
  const source = parts.filter(Boolean).join('|')
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

const pickPlaceholder = (...seedParts) => PLACEHOLDER_POOL[buildSeed(...seedParts) % PLACEHOLDER_POOL.length]

// Detecta URLs de servicios discontinuados/inestables para forzar el fallback local.
const isProblematicImageSource = (url) => {
  const value = String(url ?? '').toLowerCase()
  return (
    value.includes('loremflickr.com') ||
    value.includes('lorempicsum') ||
    value.includes('source.unsplash.com')
  )
}

export const FALLBACK_IMAGES = {
  hero: PLACEHOLDER_POOL[0],
  portrait: PLACEHOLDER_POOL[1],
  cover: PLACEHOLDER_POOL[2],
  square: PLACEHOLDER_POOL[3],
}

export const buildTalentPortraitFallback = (talent) =>
  pickPlaceholder('portrait', talent?.id, talent?.stage_name, talent?.category)

export const buildTalentCoverFallback = (talent) =>
  pickPlaceholder('cover', talent?.id, talent?.stage_name, talent?.category)

export const buildTalentPortfolioFallback = (talent, item) =>
  pickPlaceholder('portfolio', talent?.id, item?.id, item?.sort_order)

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
