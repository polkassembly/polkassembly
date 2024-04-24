describe('Search functionality', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      console.error('Uncaught Exception:', err.message);
      return false;
    });
  
    before(() => {
      cy.visit('https://polkadot.polkassembly.io/');
    });
  
    it("Verify the Search  suggestion functionality ", () => {
      cy.get('span.anticon-search').click();
      cy.wait(1000);
  
      cy.get('input.ant-input').type('paras');
      cy.wait(5000);

     // Verify if the suggestion for "parasraghav" is visible in the suggestions list
     cy.get('.ant-list-items').contains('parasraghav').should('be.visible');

     cy.get('.ant-input-group-addon').click();
    });
  });
  