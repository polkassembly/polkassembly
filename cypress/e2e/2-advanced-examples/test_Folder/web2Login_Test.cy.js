
describe('Login functionality', () => {
  it('Logs in to the website', () => {
    // Visit the website
    cy.visit('https://polkadot.polkassembly.io')
    cy.wait(2000);

    // Click on the login button
    cy.get('button[text="Login"]').click()
    cy.wait(1000);

    // Wait for the login popup to appear
    cy.get('span.font-semibold').contains('Login with Username/Email').click()
    cy.wait(1000);

    // Fill in the username/email
    cy.get('input#username').type('paras@polkassembly.io')

    // Fill in the password
    cy.get('input#password').type('Gjmptw%4567890')

    // Submit the login form
    cy.get('button').contains('Login').click()
  })
})
