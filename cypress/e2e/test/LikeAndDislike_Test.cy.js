describe('Like and Dislike Feature Test', () => {
  it('should login, navigate to a specific post, like and reset like and comment, then logout', () => {
      // Log in using the custom login command
      cy.login();
  
      // Navigate to the specific post
      cy.visit("https://polkadot.polkassembly.io/post/2355");
      cy.wait(3000);
  
      // Click on the like button to like the post
      cy.get(':nth-child(1) > :nth-child(1) > .ant-btn > .flex').first().click();
      cy.wait(3000);
      
      // Click on the like button again to reset the like
      cy.get(':nth-child(2) > :nth-child(1) > .ant-btn > .flex').first().click();
      cy.wait(3000);
  
      // Add a comment
      cy.get('[data-testid="text-area"]').type("Test");
      cy.wait(5000);
  
      cy.get('#comment-content-form > div > div.ant-form-item > div > div > div > div > div > button').click();
      cy.wait(3000);
  
      // Assuming there are modal elements to select sentiment and confirm
      cy.get('.ant-slider-step > [style="left: 75%; transform: translateX(-50%);"]').first().click();
      cy.wait(1000);
  
      cy.get('.justify-center > .ant-btn > :nth-child(1)').first().click();
      cy.wait(3000);
  
      // Logout using the custom logout command
      cy.logout();
  });
});
