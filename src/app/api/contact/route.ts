import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Vérification des champs requis
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Créer le contenu de l'email
    const emailContent = `
      Nouveau message de contact:
      
      Nom: ${name}
      Email: ${email}
      Message: ${message}
    `;

    // Envoyer l'email via l'API email de votre hébergeur ou un service SMTP
    // Note: Remplacer cette partie avec votre solution d'envoi d'email préférée
    const response = await fetch('https://api.votrehebergeur.com/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        to: 'contact@smiletext.fr',
        subject: `Nouveau message de contact de ${name}`,
        text: emailContent,
      }),
    });

    if (!response.ok) {
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
