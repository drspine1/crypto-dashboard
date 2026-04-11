interface EmptyStateProps {
  title: string
  description?: string
  icon?: string
}

export const EmptyState = ({ title, description, icon = '📭' }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description && <p className="text-sm text-white mt-2">{description}</p>}
  </div>
)
