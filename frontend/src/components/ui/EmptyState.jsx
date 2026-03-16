const EmptyState = ({ title, message }) => {
  return (
    <div className="border border-fog bg-white/70 px-5 py-8 text-center sm:p-10">
      <p className="font-display text-2xl leading-tight text-ink sm:text-3xl">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-smoke">{message}</p>
    </div>
  )
}

export default EmptyState
