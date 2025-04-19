import { ReactNode } from 'react'

export default function MDXLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose max-w-none">
        {children}
      </div>
    </div>
  )
}

