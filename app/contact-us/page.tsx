import { MDXRemote } from 'next-mdx-remote/rsc'
import MDXLayout from '../mdx-layout'

const content = `
# Contact Us

We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us.

## Customer Service Hours

Monday - Friday: 9:00 AM - 5:00 PM (EST)
Saturday - Sunday: Closed

## Contact Information

- **Email**: support@glowbeauty.com
- **Phone**: 1-800-GLOW-123
- **Address**: 123 Beauty Lane, Cosmetic City, ST 12345

## Get in Touch

For the fastest response, please use our contact form below:

<ContactForm />

We aim to respond to all inquiries within 24-48 hours during business days.

## Connect with Us

Follow us on social media for the latest updates, beauty tips, and exclusive offers:

- [Facebook](https://www.facebook.com/glowbeauty)
- [Instagram](https://www.instagram.com/glowbeauty)
- [Twitter](https://www.twitter.com/glowbeauty)
- [Pinterest](https://www.pinterest.com/glowbeauty)

Thank you for choosing Glow Beauty. We appreciate your business and look forward to serving you!
`

const components = {
  ContactForm: () => (
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" name="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea id="message" name="message" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
      </div>
      <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Send Message
      </button>
    </form>
  )
}

export const metadata = {
  title: 'Contact Us | Glow Beauty',
  description: 'Get in touch with Glow Beauty for any questions or concerns.',
}

export default function ContactUs() {
  return (
    <MDXLayout>
      <MDXRemote source={content} components={components} />
    </MDXLayout>
  )
}

