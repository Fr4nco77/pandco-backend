export const purchaseErrorTemplate = (name: string, frontendUrl: string) => ({
  subject: 'Payment Error',
  html: `
    <div style="background-color: #ffffff;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; min-width: 100%; margin: 0px auto;" role="presentation" bgcolor="#ffffff">
    <tbody>
      <tr>
        <td valign="top">
          <center style="width: 100%;">
            <!-- Header Image -->
            <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" style="width: 600px; min-width: 600px; max-width: 600px; margin: auto; border-collapse: collapse;" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 5px 0px;" align="left" bgcolor="#ffffff">
                    <a href="${frontendUrl}" target="_blank">
                      <img src="https://cdn.filestackcontent.com/api/file/Uk2yVfiXQOKrzKe4rVyH/convert?fit=max&w=900" width="100%" border="0" style="width: 100%; display: block; max-width: 600px; outline: none; height: auto;">
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Main Content -->
            <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" style="width: 600px; margin: auto; border-collapse: collapse;" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 20px 40px 5px;" bgcolor="#ffffff">
                    <h1 style="font-family: 'Courier New', Courier, monospace; font-size: 24px; line-height: 34px; font-weight: 700; color: #231f20; text-transform: uppercase; margin: 0px;" align="left">Payment Error</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 40px;" bgcolor="#ffffff">
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 0px;" align="left">
                      Hey ${name},
                    </p>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 10px 0px 0px;" align="left">
                      We're sorry, but there was an issue processing your recent order. Your payment was not successful, and no funds were captured. 
                    </p>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 10px 0px 0px;" align="left">
                      This can often happen due to an incorrect billing address, an expired card, or a temporary connection issue with the bank.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px;" bgcolor="#ffffff" align="left">
                    <table cellspacing="0" cellpadding="0" border="0" role="presentation">
                      <tr>
                        <td style="border-radius: 1px;" align="center" bgcolor="#2c241d">
                          <a href="${frontendUrl}/cart" target="_blank" style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-weight: 400; text-transform: uppercase; display: block; background-color: #2c241d; color: #fcfcfc; padding: 15px 20px; text-decoration: none; letter-spacing: 0.5px;">
                            Return to Checkout
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0px 40px 20px; font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20;" align="left">
                    If you continue to experience issues, please contact your bank or reach out to our support team.<br><br>
                    Email: support@pand.co<br><br>
                    Many thanks,<br>
                    P&Co
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Footer -->
            <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" style="width: 600px; margin: auto; border-collapse: collapse; border-top: 1px solid #eeeeee;" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 20px 0px;" bgcolor="#ffffff">
                    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="33%" align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; text-transform: uppercase;">
                          <a href="${frontendUrl}/collections/mens" target="_blank" style="color: #000000; text-decoration: none;">MENS</a>
                        </td>
                        <td width="33%" align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; text-transform: uppercase;">
                          <a href="${frontendUrl}/collections/womens" target="_blank" style="color: #000000; text-decoration: none;">WOMENS</a>
                        </td>
                        <td width="33%" align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 12px; text-transform: uppercase;">
                          <a href="mailto:support@pand.co" style="color: #000000; text-decoration: none;">CONTACT US</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 30px;" align="center">
                     <p style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #717171; text-transform: uppercase; margin: 0px;">
                        <a href="${frontendUrl}" target="_blank" style="color: #000000; text-decoration: none;">WWW.PAND.CO</a><br>
                        P&Co Copyright © 2026
                     </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </td>
      </tr>
    </tbody>
  </table>
</div>`,
});
