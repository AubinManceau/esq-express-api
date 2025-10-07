import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendVerificationEmail = async (email, firstName, lastName, token) => {
    const mailSubject = "Bienvenue à l'ES Quelaines - Finalisez votre inscription";
    const mailContent = ({ firstName, lastName, token }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Bienvenue ${firstName} ${lastName} !</h1>
            <p>Nous sommes ravis de vous accueillir à l'<strong>ESQ</strong>.</p>
            <p>Pour finaliser votre inscription, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>48 heures</strong>.</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="https://localhost:4000/inscription?token=${token}" 
                    style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Complétez votre inscription
                </a>
            </div>
            <p>Vous pouvez également télécharger notre application :</p>
            <ul style="list-style-type: none; padding: 0;">
                <li style="margin: 10px 0;">
                    <a href="https://www.apple.com/app-store/" target="_blank" style="color: #0066cc; text-decoration: none;">
                        📱 Télécharger depuis l'App Store
                    </a>
                </li>
                <li style="margin: 10px 0;">
                    <a href="https://play.google.com/store" target="_blank" style="color: #0066cc; text-decoration: none;">
                        🤖 Télécharger depuis le Play Store
                    </a>
                </li>
            </ul>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à 
                <a href="mailto:support@esq.com" style="color: #0066cc;">support@esq.com</a>.
            </p>
            <p style="margin-top: 30px;">
                À très bientôt,<br>
                <strong>Le bureau de l'ESQ</strong>
            </p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: mailSubject,
        html: mailContent({ firstName, lastName, token }),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email :", emailError);
    }
}

export const sendPasswordResetEmail = async (email, firstName, lastName, token) => {
    const mailSubject = "Réinitialisation de votre mot de passe - ES Quelaines";
    const mailContent = ({ firstName, lastName, token }) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Bonjour ${firstName} ${lastName} !</h1>
            <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous n'êtes pas à l'origine de cette demande, vous pouvez l'ignorer.</p>
            <p>Pour réinitialiser votre mot de passe, veuillez suivre le lien ci-dessous. Ce lien est valide pendant <strong>1 heure</strong>.</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="https://localhost:4000/reinitialiser?token=${token}" 
                    style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Réinitialisez votre mot de passe
                </a>
            </div>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à 
                <a href="mailto:support@esq.com" style="color: #0066cc;">support@esq.com</a>.
            </p>
            <p style="margin-top: 30px;">
                À très bientôt,<br>
                <strong>Le bureau de l'ESQ</strong>
            </p>
        </div>
    `;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: mailSubject,
        html: mailContent({ firstName, lastName, token }),
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email :", emailError);
    }
}
