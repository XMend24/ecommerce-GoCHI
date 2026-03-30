const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const { verificarToken } = require('../middleware/auth'); 

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', verificarToken, async (req, res) => {
    const { nombreCliente, telefono, direccion, bancoOrigen, numeroReferencia, montoTotal, carrito } = req.body;

    try {
        const data = await resend.emails.send({
            from: 'Gochi Store <onboarding@resend.dev>', 
            to: [process.env.EMAIL_ADMIN], 
            subject: `🛍️ Nueva Venta G☆CHI - Ref: ${numeroReferencia}`,
            html: `
                <h1>Nueva Notificación de Pago</h1>
                <p><strong>Cliente:</strong> ${nombreCliente}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Dirección:</strong> ${direccion}</p>
                <p><strong>Banco:</strong> ${bancoOrigen}</p>
                <p><strong>Referencia:</strong> ${numeroReferencia}</p>
                <p><strong>Monto:</strong> ${montoTotal}</p>
                <hr>
                <p><strong>Productos:</strong> ${carrito}</p>
            `
        });

        console.log("✅ Correo enviado vía Resend:", data);
        res.status(200).json({ message: "Pago reportado con éxito" });

    } catch (error) {
        console.error("❌ Error con Resend:", error);
        res.status(500).json({ error: "Error al procesar el envío" });
    }
});

module.exports = router;