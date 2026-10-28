import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './Icons'

interface SectionHeadingProps {
  index: string
  kicker: string
  title: string
  description?: string
  action?: {
    label: string
    to: string
  }
}

export default function SectionHeading({ index, kicker, title, description, action }: SectionHeadingProps) {
  return (
    <header className="section-head">
      <div className="section-head__main">
        <p className="section-kicker">
          <span>{index}</span>
          {kicker}
        </p>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>

      {action && (
        <Link className="text-link" to={action.to}>
          {action.label}
          <ArrowRightIcon size={17} />
        </Link>
      )}
    </header>
  )
}
