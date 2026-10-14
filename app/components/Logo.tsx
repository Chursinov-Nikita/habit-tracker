import { Mountain } from 'lucide-react'

type Props = {
  className?: string
  gradient?: boolean
}

export default function Logo({ className = 'h-8 w-8', gradient = false }: Props) {
  if (gradient) {
    return (
      <>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="ht-logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <Mountain
          className={className}
          fill="url(#ht-logo-gradient)"
          stroke="url(#ht-logo-gradient)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          aria-hidden="true"
        />
      </>
    )
  }

  return (
    <Mountain
      className={`${className} text-[#8B5CF6]`}
      fill="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
    />
  )
}
