import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import Reminder from '../models/Reminder.js'
import User from '../models/User.js'
import Habit from '../models/Habit.js'
import cron from 'node-cron'
import dayjs from 'dayjs'

dotenv.config()

const SENDGRID_KEY = process.env.SENDGRID_API_KEY
let sendEmail = async () => {
  console.log('SendGrid not configured; skipping email send')
}

if (SENDGRID_KEY) {
  // Lazy import to avoid hard dependency if not configured
  const sgMail = await import('@sendgrid/mail')
  sgMail.default.setApiKey(SENDGRID_KEY)
  sendEmail = async ({ to, subject, text, html }) => {
    return sgMail.default.send({ to, from: process.env.SENDGRID_FROM || 'noreply@habitstracker.local', subject, text, html })
  }
}

const runOnce = async () => {
  await connectDB()
  console.log('Reminder scheduler started')

  // Run every minute and check reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = dayjs()
      const reminders = await Reminder.find({ enabled: true }).populate('userId habitId')
      for (const r of reminders) {
        // Compare time in reminder timezone or server timezone
        let currentTime = now
        if (r.time && r.time.length >= 4) {
          const [hh, mm] = r.time.split(':').map(Number)
          if (currentTime.hour() === hh && currentTime.minute() === mm) {
            // send notification
            const user = r.userId
            const habit = r.habitId
            if (user && user.email && process.env.SENDGRID_API_KEY) {
              const subject = `Reminder: ${habit ? habit.name : 'Habit'}`
              const text = `Hi ${user.name || ''},\n\nThis is a reminder to work on: ${habit ? habit.name : 'your habit'}.` 
              await sendEmail({ to: user.email, subject, text, html: `<p>${text}</p>` })
              r.lastSentAt = new Date()
              await r.save()
              console.log('Sent reminder to', user.email)
            } else {
              // Could implement web-push here
              console.log('Reminder would be sent for', user?._id, 'habit', habit?._id)
            }
          }
        }
      }
    } catch (err) {
      console.error('Reminder scheduler error', err.message)
    }
  })
}

runOnce()
