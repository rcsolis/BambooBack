import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "contacto@bamboohogar.mx",
        pass: "OminumZ2020",
    },
});

// transporter.verify(function(error: any) {
//     if (error) {
//         functions.logger.info(error);
//     } else {
//       functions.logger.info("Email:Send. Server is ready to take our messages.");
//     }
// });

export const send = functions.https.onRequest(async (request, response) => {
    try {
        functions.logger.info("Email:Send. Start");

        if (request.method !== "POST" && request.is("application/json")) {
            throw new functions.https.HttpsError(
                "unimplemented",
                "Method not allowed");
        }

        if (request.body === undefined ) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Data is empty");
        }

        const { property, type, contact, description } = request.body;

        const mail = {
            from: "contacto@bamboohogar.mx",
            to: "jonatan@ominumz.mx",
            subject: `Interesados en ${property}`,
            html: `<h1> Interesado en la propiedad ${ property }  </h1>` +
                "<hr />" +
                "<ul>" +
                    `<li> Quiere ser contactado con ${ type } </li>` +
                    `<li> Su contacto ${ contact } </li>` +
                    `<li> Descripción de lo que pide: ${ description } </li>` +
                "</ul>",
        };
        functions.logger.log("Sending email");
        const mailInfo = await transporter.sendMail(mail);
        functions.logger.log("Email Send:", mailInfo,
            mailInfo.messageId, mailInfo.response);
        functions.logger.info("Email:Send. END.");
        response.status(200).json({ status: "OK" });
    } catch ( error ) {
        functions.logger.error("Exception in Email:Send. ", error);
        if (error.message) {
            response.status(500).json({
                code: error.code,
                error: error.message,
            });
        } else {
            response.status(500).json({
                code: 500,
                error: error,
            });
        }
    }
});
