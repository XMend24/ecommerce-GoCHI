const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verificarToken } = require('../middleware/auth'); 

// Configuración del "Cartero" de correos
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS
    }
});

// POST /api/checkout - Recibir formulario de pago
router.post('/', verificarToken, async (req, res) => {
    try {
        // 1. Recibir los datos del formulario del frontend
        const { nombreCliente, telefono, direccion, bancoOrigen, numeroReferencia, montoTotal, carrito } = req.body;

        // 2. Construir el contenido del correo
        const mailOptions = {
            from: `"G☆CHI Sistema de Ventas" <${process.env.EMAIL_ADMIN}>`,
            to: process.env.EMAIL_ADMIN, // 
            subject: `🚨 NUEVA COMPRA REGISTRADA - Ref: ${numeroReferencia}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #2c3e50;">
                    <h2 style="color: #D4AF37;">Notificación de Nuevo Pago</h2>
                    <p>Se ha registrado un nuevo pago por transferencia bancaria. Por favor, verifica en tu cuenta.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background-color: #f4f4f4;"><th style="padding: 10px; text-align: left;">Datos del Cliente</th></tr>
                        <tr><td style="padding: 10px;"><b>Nombre:</b> ${nombreCliente}</td></tr>
                        <tr><td style="padding: 10px;"><b>Teléfono:</b> ${telefono}</td></tr>
                        <tr><td style="padding: 10px;"><b>Dirección de entrega:</b> ${direccion}</td></tr>
                        
                        <tr style="background-color: #f4f4f4;"><th style="padding: 10px; text-align: left;">Datos del Pago</th></tr>
                        <tr><td style="padding: 10px;"><b>Banco de Origen:</b> ${bancoOrigen}</td></tr>
                        <tr><td style="padding: 10px;"><b>N° de Referencia:</b> ${numeroReferencia}</td></tr>
                        <tr><td style="padding: 10px;"><b>Monto Total:</b> Bs/Ref ${montoTotal}</td></tr>
                    </table>

                    <p style="margin-top: 20px;"><b>Detalles del pedido:</b> ${carrito}</p>
                </div>
            `
        };

        // 3. Enviar el correo
        await transporter.sendMail(mailOptions);


        res.json({ message: '✅ Formulario enviado con éxito. En breve verificaremos tu pago.' });

    } catch (error) {
        console.error("Error enviando el correo:", error);
        res.status(500).json({ error: 'Hubo un problema al procesar la confirmación.' });
    }
});

module.exports = router;