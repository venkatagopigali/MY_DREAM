const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        const { name, email, phone, course } = req.body || {};

        if (!name || !email || !phone || !course) {
            return res.status(400).json({ success: false, message: 'Missing required parameters: name, email, phone, and course must be provided.' });
        }

        // Format phone number to include country code (+91 by default if it's a 10-digit number)
        let formattedPhone = phone.trim();
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
        }

        console.log(`Processing enrollment: Name=${name}, Email=${email}, Phone=${formattedPhone}, Course=${course}`);

        // 0. MySQL Database Integration
        const isDbConfigured = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;
        let dbResult = { saved: false, details: 'Database environment variables not configured.' };

        if (isDbConfigured) {
            try {
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT || '3306', 10),
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME,
                    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
                });

                // Auto-create table if missing
                await connection.query(`
                    CREATE TABLE IF NOT EXISTS enrollments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        phone VARCHAR(50) NOT NULL,
                        course VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Insert student lead details
                const [queryResult] = await connection.execute(
                    'INSERT INTO enrollments (name, email, phone, course) VALUES (?, ?, ?, ?)',
                    [name, email, formattedPhone, course]
                );

                await connection.end();

                dbResult.saved = true;
                dbResult.details = `Record successfully inserted. Lead ID: ${queryResult.insertId}`;
            } catch (err) {
                console.error('MySQL database error:', err);
                dbResult.details = `Failed to save to database: ${err.message}`;
            }
        }

        // 1. Check for SMTP Configurations
        const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        let emailResult = { sent: false, details: 'SMTP environment variables not configured.' };

        if (isSmtpConfigured) {
            try {
                // Setup SMTP Transporter
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT || '587', 10),
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const adminEmail = process.env.ADMIN_EMAIL || 'venkatagopigali6@gmail.com';

                // Send admin notification
                const adminMailOptions = {
                    from: `"Nexus AI Academy Admissions" <${process.env.SMTP_USER}>`,
                    to: adminEmail,
                    subject: `🚨 [New Lead] Enrollment Request: ${name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">New Student Enrollment Registration</h2>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 35%;">Full Name:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email Address:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone Number:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${formattedPhone}">${formattedPhone}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Course Track:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #06b6d4;">${course}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Register Date:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                                </tr>
                            </table>
                            <p style="margin-top: 25px; font-size: 0.9em; color: #666;">Please follow up with the student within the next 2 hours.</p>
                        </div>
                    `
                };

                // Send student welcome email
                const studentMailOptions = {
                    from: `"Nexus AI Academy" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: `Welcome to Nexus AI Academy! Slot Reserved for ${course}`,
                    html: `
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%); padding: 30px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">Nexus AI Academy</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">Your Career Launchpad for AI & Data Science</p>
                            </div>
                            
                            <!-- Body -->
                            <div style="padding: 30px 24px;">
                                <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Hi ${name},</h3>
                                <p>Thank you for booking a <strong>Free Demo Session & Career Consultation</strong>. We are excited to assist you with your tech career journey!</p>
                                
                                <div style="background-color: #f8fafc; border-left: 4px solid #a855f7; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
                                    <h4 style="margin: 0 0 5px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Reservation Receipt:</h4>
                                    <p style="margin: 3px 0; font-size: 14px;"><strong>Program Track:</strong> ${course}</p>
                                    <p style="margin: 3px 0; font-size: 14px;"><strong>Consultant Status:</strong> Reserved & Queued</p>
                                </div>

                                <p>Our expert career counselor will contact you at <strong>${formattedPhone}</strong> shortly to align schedules and allocate your live dashboard login parameters.</p>
                                
                                <h4 style="color: #0f172a; font-size: 15px; margin-top: 25px;">What's Next?</h4>
                                <ul style="padding-left: 20px; margin: 10px 0; color: #334155; font-size: 14px;">
                                    <li style="margin-bottom: 8px;"><strong>Orientation Calendar:</strong> Check your phone for custom timezone links.</li>
                                    <li style="margin-bottom: 8px;"><strong>Prep Syllabus:</strong> Review tech concepts (Git & basic Python logic is helpful!).</li>
                                    <li style="margin-bottom: 8px;"><strong>1-on-1 Q&A:</strong> Write down your career questions regarding placements, salaries, or remote internship drives.</li>
                                </ul>

                                <div style="text-align: center; margin-top: 35px; margin-bottom: 10px;">
                                    <a href="https://wa.me/917989086886" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 15px; display: inline-block;">Chat Instantly on WhatsApp</a>
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0;">&copy; 2026 Nexus AI Academy. BKC G-Block, Bandra East, Mumbai, MH, 400051.</p>
                                <p style="margin: 5px 0 0 0;">This is an automated confirmation email. You can contact support at venkatagopigali6@gmail.com</p>
                            </div>
                        </div>
                    `
                };

                await Promise.all([
                    transporter.sendMail(adminMailOptions),
                    transporter.sendMail(studentMailOptions)
                ]);

                emailResult.sent = true;
                emailResult.details = 'Admissions and student confirmation emails dispatched successfully.';
            } catch (err) {
                console.error('SMTP Email sending error:', err);
                emailResult.details = `Failed to send email: ${err.message}`;
            }
        }

        // 2. Check for Twilio WhatsApp Configurations
        const isTwilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;
        let whatsappResult = { sent: false, details: 'Twilio environment variables not configured.' };

        if (isTwilioConfigured) {
            try {
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const fromNumber = process.env.TWILIO_PHONE_NUMBER; // e.g. +14155238886 (sandbox)

                const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
                const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

                const messageBody = `Hello *${name}*! Welcome to *Nexus AI Academy* 🚀\n\nWe have successfully reserved your demo slot for the *${course}*.\n\nOur admissions advisor will call you at *${formattedPhone}* shortly to schedule your orientation.\n\nCheck your inbox (*${email}*) for the syllabus catalog! Let's build the future together.`;

                // Prepare URL Encoded parameters for Twilio POST
                const params = new URLSearchParams();
                params.append('From', `whatsapp:${fromNumber}`);
                params.append('To', `whatsapp:${formattedPhone}`);
                params.append('Body', messageBody);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${basicAuth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString(),
                });

                const data = await response.json();

                if (response.ok) {
                    whatsappResult.sent = true;
                    whatsappResult.details = `WhatsApp notification queued. SID: ${data.sid}`;
                } else {
                    console.error('Twilio WhatsApp API Error Response:', data);
                    whatsappResult.details = `Twilio API returned error code ${data.code}: ${data.message}`;
                }
            } catch (err) {
                console.error('Twilio WhatsApp error:', err);
                whatsappResult.details = `Failed to dispatch WhatsApp: ${err.message}`;
            }
        }

        // 3. Assemble and return report
        const isDemo = !isSmtpConfigured && !isTwilioConfigured && !isDbConfigured;

        return res.status(200).json({
            success: true,
            isDemo,
            name,
            course,
            results: {
                database: dbResult,
                email: emailResult,
                whatsapp: whatsappResult
            },
            message: isDemo 
                ? 'Enrollment logged in demo/sandbox mode. SMTP and Twilio variables were not found, but calculations completed.' 
                : 'Enrollment processed. Emails and WhatsApp notifications successfully initiated.'
        });

    } catch (error) {
        console.error('Endpoint Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
