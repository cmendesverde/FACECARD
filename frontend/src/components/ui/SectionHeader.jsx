const SectionHeader = ({ eyebrow, title, description }) => {
  return (
    <header className="mb-8 md:mb-14">
      {eyebrow ? <p className="mb-3 facecard-subtitle">{eyebrow}</p> : null}
      <h2 className="font-display text-[2.1rem] leading-[0.95] text-ink sm:text-5xl md:text-6xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-smoke">{description}</p> : null}
    </header>
  )
}

export default SectionHeader
