describe('Verify Polkadot and Parachain functionality', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      console.error('Uncaught Exception:', err.message);
      return false;
    });  
  
    it('should interact with the dropdown and verify functionality', () => {
      // Visit the website
      cy.visit("https://polkadot.polkassembly.io/");
  
      // Loop through child elements from 1 to 16
      for (let i = 1; i <= 16; i++) {

        if (i === 5) {
            // Continue to the next iteration of the loop
            continue;
          }
        // Click on the dropdown trigger to open the dropdown
        cy.get('a.ant-dropdown-trigger').click();
  
        // Wait for 3000ms to ensure the dropdown menu appears
        cy.wait(2000);
  
        // Click on a specific child element based on the value of i
        if (i === 4) {
          // Perform a specific action if i is equal to 4
          cy.get('.ant-card-body > :nth-child(2) > :nth-child(3) > .flex > .capitalize').click();
        } 
        else if (i === 7) {
        // Perform a specific action if i is equal to 7
        cy.get(':nth-child(2) > :nth-child(7) > .flex > .capitalize').click(); }
        else if (i === 8) {
        // Perform a specific action if i is equal to 8
        cy.get(':nth-child(2) > :nth-child(8) > .flex > .capitalize').click();
        }
        else {
          // Click on the child element
          cy.get(`:nth-child(2) > :nth-child(${i}) > .my-2 > .text-sm`).click();
        }
  
        // Wait for 5000ms
        cy.wait(4000);
      }
    });
  });
  