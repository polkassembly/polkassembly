/*describe('Talisman Extension Login', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        console.error('Uncaught Exception:', err.message);
        return false;

      });  
      Cypress.Commands.add('loginWithPolkadotExtension', () => {
        cy.visit('https://chromewebstore.google.com/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd'); // Visit the extension popup URL
      
        // Handle the extension interaction
        cy.get('#account-select-dropdown') // Replace with actual selector from the extension popup
          .click();
        cy.get('.account-item') // Replace with actual selector from the extension popup
          .contains('your-account-name') // Replace with the account name
          .click();
        cy.get('button')
          .contains('Sign')
          .click();
      });
      
      it('should log in using Polkadot extension', () => {
        // Visit the website
        cy.visit('https://polkadot.polkassembly.io');
    
        // Click on the Login button
        cy.get('button')
          .contains('Login')
          .click();
    
        // Click on the Polkadot.js button
        cy.get('button')
          .contains('Polkadot.js')
          .click();
    
        // Click on the Got it button
        cy.get('button')
          .contains('Got it!')
          .click();
    
        // Verify login by checking the presence of an element exclusive to logged-in users
        cy.get('div.ant-dropdown-trigger').should('be.visible');
      });
    });*/