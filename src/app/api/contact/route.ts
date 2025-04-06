import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, organization, projectType, message, urgent } = body;

    // Vérification des champs requis
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Les champs nom, prénom, email et message sont requis' },
        { status: 400 }
      );
    }

    // Formatage du nom complet
    const fullName = `${firstName} ${lastName}`;
    
    // Déterminer le sujet de l'email en fonction de l'urgence
    const subject = urgent 
      ? `[URGENT] Demande de devis express de ${fullName}` 
      : `Nouveau message de contact de ${fullName}`;

    // Créer le contenu HTML de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">${urgent ? 'Demande de devis express' : 'Nouveau message de contact'}</h2>
        <p><strong>De:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
        ${organization ? `<p><strong>Organisation:</strong> ${organization}</p>` : ''}
        ${projectType ? `<p><strong>Type de projet:</strong> ${projectType}</p>` : ''}
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
        ${urgent ? '<p style="color: #dc2626; font-weight: bold; margin-top: 20px;">Cette demande est marquée comme urgente et nécessite une réponse sous 24h.</p>' : ''}
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Cet email a été envoyé depuis le formulaire de contact du site Smiletex.</p>
      </div>
    `;

    // Version texte brut pour les clients email qui ne supportent pas l'HTML
    const textContent = `
      ${urgent ? 'DEMANDE DE DEVIS EXPRESS' : 'NOUVEAU MESSAGE DE CONTACT'}

      De: ${fullName}
      Email: ${email}
      ${phone ? `Téléphone: ${phone}\n` : ''}
      ${organization ? `Organisation: ${organization}\n` : ''}
      ${projectType ? `Type de projet: ${projectType}\n` : ''}

      Message:
      ${message}

      ${urgent ? '\nCette demande est marquée comme urgente et nécessite une réponse sous 24h.' : ''}
      
      Cet email a été envoyé depuis le formulaire de contact du site Smiletex.
    `;

    // Envoyer l'email en utilisant notre module mailer
    const emailSent = await sendEmail({
      to: process.env.EMAIL_USER || 'contact@smiletex.fr',
      subject: subject,
      html: htmlContent,
      text: textContent,
      replyTo: email
    });

    if (!emailSent) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
