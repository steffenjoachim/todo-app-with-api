/// <reference types="cypress" />

describe('Todo App', () => {
  const newTodoDescription = 'Learn Cypress'; // Description for the new todo

  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/src/index.html'); // Visits the Todo app page before each test
  });

  it('should have input field and filters', () => {
    cy.get('input#todo-input').should('exist'); // Checks that the todo input field exists
    cy.get('form.radioForm').should('exist'); // Checks that the filter form exists
  });

  it('should add a new todo', () => {
    // Finds the input field, enter the new text, and click the "Add" button
    cy.get('#todo-input').type(newTodoDescription);
    cy.get('#add-btn').click();

    // Verifies that the new todo is present in the list
    cy.get('.todos-container .todo label').should('contain', newTodoDescription);
  });

  it('should prevent adding a duplicate todo', () => {
    // First attempt: Adds the todo
    cy.get('#todo-input').type(newTodoDescription);
    cy.get('#add-btn').click();

    // Second attempt: Tries to add the same todo again
    cy.get('#todo-input').type(newTodoDescription);
    cy.get('#add-btn').click();

    // Veries that an alert is displayed
    cy.on('window:alert', (str) => {
      expect(str).to.equal('This todo already exists!'); // Check the alert message
    });
  });

  it('should delete the newly added todo', () => {
    // Finds the todo label that contains the description
    cy.get('.todos-container .todo label').contains(newTodoDescription).then(($label) => {
      // Find the corresponding checkbox input of the todo and check it
      cy.wrap($label).prev('input[type="checkbox"]').check(); // Check the checkbox

      // Adds a wait time to ensure the DOM is updated
      cy.wait(500); // Adjust the wait time based on application behavior

      // Verifies that the checkbox is checked
      cy.wrap($label).prev('input[type="checkbox"]').should('be.checked');

      // Clicks the "Remove Done Todos" button
      cy.get('button.btn').contains('Remove Done Todos').click();

      // Checks that the todo with the saved description no longer exists
      cy.get('.todos-container .todo label').should('not.contain', newTodoDescription);
    });
  });  
});
