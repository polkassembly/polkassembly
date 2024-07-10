// cypress/support/commands.js

// Custom command to handle login
Cypress.Commands.add('login', () => {
  const username = Cypress.env('username');
  const password = Cypress.env('password');

  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', (err, runnable) => {
    console.error('Uncaught Exception:', err.message);
    return false;
  });

  // Visit the website
  cy.visit("https://polkadot.polkassembly.io/")
  cy.wait(2000);

  // Click on the login button
  cy.get('button[text="Login"]').click()
  cy.wait(3000);

  // Wait for the login popup to appear
  cy.get('span.font-semibold').contains('Login with Username/Email').click()
  cy.wait(2000);

  // Fill in the username/email
  cy.get('input#username').type("paras@polkassembly.io");
  cy.wait(2000);

  // Fill in the password
  cy.get('input#password').type("Polka@123");
  cy.wait(2000);

  // Submit the login form
  cy.get('button[text="Login"][type="submit"]').click();
  cy.wait(4000);
});


// Custom command to handle logout
Cypress.Commands.add('logout', () => {
  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', (err, runnable) => {
    console.error('Uncaught Exception:', err.message);
    return false;
  });

  // Wait for the user dropdown to appear and click it
  cy.get('.normal-case').click();
  cy.wait(3000);

  // Wait for the dropdown menu to become visible
  cy.get('.ant-dropdown-menu-title-content > .mt-1').click();
  cy.wait(2000);
});
