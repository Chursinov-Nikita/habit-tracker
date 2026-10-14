import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function GradientText({ children, className = '' }: Props) {
  return (
    <span
      className={`bg-[linear-gradient(90deg,#8B5CF6_0%,#3B82F6_100%)] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}
