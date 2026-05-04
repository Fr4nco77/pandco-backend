export const registerTemplate = (name: string, frontendUrl: string) => ({
  subject: 'Your P&Co account has been set up!',
  html: `<div style="background-color: #ffffff;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; min-width: 100%; margin: 0px auto; text-rendering: optimizelegibility;" role="presentation" bgcolor="#ffffff">
    <tbody>
      <tr>
        <td valign="top">
          <center style="width: 100%;">
            <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" style="width: 600px; min-width: 600px; max-width: 600px; margin: auto; border-collapse: collapse;" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 5px 0px;" align="left" bgcolor="#ffffff">
                    <a href="${frontendUrl}" target="_blank" style="text-decoration: none;">
                      <img src="https://cdn.filestackcontent.com/api/file/Uk2yVfiXQOKrzKe4rVyH/convert?fit=max&w=900" width="100%" border="0" style="width: 100%; display: block; max-width: 600px; outline: none; height: auto;">
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <table border="0" width="600" cellpadding="0" cellspacing="0" align="center" style="width: 600px; margin: auto; border-collapse: collapse;" role="presentation">
              <tbody>
                <tr>
                  <td style="padding: 20px 40px;" bgcolor="#ffffff">
                    <h1 style="font-family: 'Courier New', Courier, monospace; font-size: 24px; line-height: 34px; font-weight: 700; color: #231f20; text-transform: uppercase; margin: 0px;" align="left">Your account is live</h1>
                    
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 20px 0 10px;">
                      Hey ${name},
                    </p>
                    
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 0px;">
                      Now that you have successfully created your P&Co account you can save items to your wishlist & spend less time at checkout with saved addresses & billing information. You will also be welcomed into our P&Co Loyalty Dept. where you can, unlock discounts, exclusives & more!
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0px 40px 20px;" bgcolor="#ffffff">
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 20px; color: #231f20; margin: 0px;">
                      Please do not hesitate to contact us if you have any questions at all.<br><br>
                      Email: support@pand.co<br><br>
                      Many thanks,<br>
                      P&Co
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

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
