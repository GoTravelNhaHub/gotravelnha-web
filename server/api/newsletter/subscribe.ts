import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { sendEmail, escapeHtml } from '~/server/utils/email'
import { enforceRateLimit } from '~/server/utils/activity-limits'

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'newsletter', 5, 10 * 60 * 1000)
  try {
    const body = await readBody(event)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : ''
    const source = typeof body?.source === 'string' ? body.source.trim().slice(0, 40) : 'website'

    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: 'Valid email is required'
      }
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      if (existing.isActive) {
        return {
          success: true,
          message: 'You are already subscribed!',
          alreadySubscribed: true
        }
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null
          }
        })
        return {
          success: true,
          message: 'Welcome back! You have been resubscribed.'
        }
      }
    }

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'website',
        isActive: true
      }
    })

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to GoTravelNha Newsletter! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Welcome to GoTravelNha!</h1>
            <p>Thank you for subscribing to our newsletter. You'll receive:</p>
            <ul>
              <li>📧 Weekly travel deals and discounts</li>
              <li>✈️ Exclusive offers from Trip.com, Klook, and more</li>
              <li>🎯 Price drop alerts for destinations you're interested in</li>
              <li>📝 Travel tips and guides</li>
            </ul>
            <p>Happy travels! 🗺️</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              <a href="${escapeHtml(process.env.NUXT_PUBLIC_SITE_URL || 'https://gotravelnha.com')}/newsletter/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail subscription if email fails
    }

    return {
      success: true,
      message: 'Successfully subscribed! Check your email for confirmation.'
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    if (error?.statusCode === 429) throw error
    return {
      success: false,
      error: 'Failed to subscribe. Please try again.'
    }
  }
})

