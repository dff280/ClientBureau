export function FieldError({
  name,
  errors,
}: {
  name: string
  errors?: Record<string, string[]>
}) {
  const messages = errors?.[name]

  if (!messages?.length) return null

  return <p className="text-xs font-medium text-red-700">{messages[0]}</p>
}
