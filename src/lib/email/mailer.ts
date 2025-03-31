import nodemailer from 'nodemailer';

// Fonction pour créer un transporteur d'emails
// Si nous sommes en mode développement, utiliser Ethereal pour les tests
export async function createTransporter() {
  // Vérifier si nous avons déjà un transporteur configuré
  if (global.emailTransporter) {
    return global.emailTransporter;
  }
  
  // Si USE_ETHEREAL est défini à true, utiliser Ethereal
  // Sinon, utiliser la configuration réelle même en développement
  if (process.env.USE_ETHEREAL === 'true') {
    console.log('Utilisation d\'Ethereal Email pour les tests...');
    // Créer un compte de test Ethereal
    const testAccount = await nodemailer.createTestAccount();
    console.log('Compte Ethereal créé:', testAccount.user);
    
    // Créer un transporteur avec Ethereal
    const etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Stocker le transporteur pour les futurs appels
    global.emailTransporter = etherealTransporter;
    global.isEtherealTransporter = true;
    
    return etherealTransporter;
  }
  
  // Utiliser la configuration normale avec Gmail ou autre
  console.log('Utilisation de la configuration SMTP réelle avec Gmail...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Défini' : 'Non défini');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Défini (longueur: ' + process.env.EMAIL_PASSWORD.length + ')' : 'Non défini');
  const regularTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Changer selon votre fournisseur d'email
    port: 587,
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || '',
    },
  });
  
  // Stocker le transporteur pour les futurs appels
  global.emailTransporter = regularTransporter;
  global.isEtherealTransporter = false;
  
  return regularTransporter;
}

// Déclaration pour TypeScript
declare global {
  var emailTransporter: nodemailer.Transporter;
  var isEtherealTransporter: boolean;
}

// Interface pour les options d'email
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

/**
 * Envoie un email avec les options spécifiées
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, from, text, replyTo } = options;
    
    console.log('Configuration email:', {
      EMAIL_USER: process.env.EMAIL_USER ? '✓ Défini' : '✗ Non défini',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✓ Défini' : '✗ Non défini',
      to,
      subject
    });
    
    // Obtenir le transporteur
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: from || `${process.env.NEXT_PUBLIC_SITE_NAME} <${process.env.EMAIL_USER || 'noreply@smiletex.com'}>`,
      to,
      subject,
      text: text || '',
      html,
      replyTo: replyTo || process.env.EMAIL_USER || 'noreply@smiletex.com',
    };
    
    console.log('Tentative d\'envoi d\'email à:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    
    // Si nous utilisons Ethereal, afficher l'URL de prévisualisation
    if (global.isEtherealTransporter) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Prévisualisation de l\'email (cliquez sur ce lien):', previewUrl);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
    }>;
    total: number;
    shippingCost: number;
    customerName?: string;
  }
): Promise<boolean> {
  console.log('Début de l\'envoi de l\'email de confirmation de commande à:', to);
  console.log('Détails de la commande:', JSON.stringify(orderDetails, null, 2));
  const { orderId, items, total, shippingCost, customerName } = orderDetails;
  
  // Générer le contenu HTML pour les articles
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} ${item.size ? `(${item.size})` : ''} ${item.color ? `- ${item.color}` : ''}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} €</td>
    </tr>
  `).join('');
  
  const subtotal = total - shippingCost;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { max-width: 150px; }
        h1 { color: #4f46e5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f3f4f6; text-align: left; padding: 10px; }
        .total-row { font-weight: bold; background-color: #f9fafb; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.NEXT_PUBLIC_SITE_NAME}</h1>
          <p>Confirmation de commande</p>
        </div>
        
        <p>Bonjour ${customerName || 'cher client'},</p>
        
        <p>Nous vous remercions pour votre commande. Voici un récapitulatif :</p>
        
        <p><strong>Numéro de commande :</strong> ${orderId}</p>
        
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: center;">Quantité</th>
              <th style="text-align: right;">Prix unitaire</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Sous-total</strong></td>
              <td style="text-align: right; padding: 10px;">${subtotal.toFixed(2)} €</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Frais de livraison</strong></td>
              <td style="text-align: right; padding: 10px;">${shippingCost.toFixed(2)} €</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding: 10px;"><strong>Total</strong></td>
              <td style="text-align: right; padding: 10px;">${total.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
        
        <p>Nous vous tiendrons informé de l'avancement de votre commande. Vous pouvez suivre son statut dans votre espace client.</p>
        
        <p>Merci pour votre confiance !</p>
        
        <p>L'équipe ${process.env.NEXT_PUBLIC_SITE_NAME}</p>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>${process.env.NEXT_PUBLIC_SITE_NAME} - ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to,
    subject: `Confirmation de votre commande #${orderId}`,
    html,
  });
}
