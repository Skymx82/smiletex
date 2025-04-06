import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const emailContent = `
      <h2>Nouveau devis reçu</h2>
      
      <h3>Détails de la commande :</h3>
      <ul>
        <li><strong>Type de produit :</strong> ${data.type}</li>
        <li><strong>Quantité :</strong> ${data.quantity}</li>
        <li><strong>Texte à personnaliser :</strong> ${data.text || 'Non spécifié'}</li>
      </ul>
      
      <h3>Informations du client :</h3>
      <ul>
        <li><strong>Nom :</strong> ${data.name}</li>
        <li><strong>Email :</strong> ${data.email}</li>
        <li><strong>Téléphone :</strong> ${data.phone}</li>
      </ul>
    `;

    // Envoyer l'email au propriétaire du site
    await sendEmail({
      to: 'mattias.mathevon@gmail.com', // Remplacez par votre email
      subject: 'Nouvelle demande de devis',
      html: emailContent,
      replyTo: data.email
    });

    // Envoyer une confirmation au client
    await sendEmail({
      to: data.email,
      subject: 'Confirmation de votre demande de devis',
      html: `
        <h2>Merci pour votre demande de devis !</h2>
        
        <p>Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.</p>
        
        <h3>Récapitulatif de votre demande :</h3>
        <ul>
          <li><strong>Type de produit :</strong> ${data.type}</li>
          <li><strong>Quantité :</strong> ${data.quantity}</li>
          <li><strong>Texte à personnaliser :</strong> ${data.text || 'Non spécifié'}</li>
        </ul>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <p>L'équipe smiletex</p>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Devis envoyé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du devis:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors de l\'envoi du devis' 
      },
      { status: 500 }
    );
  }
}
