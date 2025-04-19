import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is one of our MDX pages
  if (['/contact-us', '/shipping-information', '/returns-and-exchanges', '/faq'].includes(path)) {
    // Allow access to these pages without redirection
    return NextResponse.next()
  }

  // Add any other middleware logic here

  return NextResponse.next()
}

