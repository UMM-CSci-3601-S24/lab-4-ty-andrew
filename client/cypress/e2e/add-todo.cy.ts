
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('testowner');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectBoolean(page.getFormField('status'), 'Complete');
    page.addTodoButton().should('be.disabled');
    page.selectMatSelectValue(page.getFormField('category'), 'video games');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('anythinghere');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid owner', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the name field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid name inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type('This is a very long name that goes beyond the 50 character limit').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid name should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');
});

  it('Should show error messages for invalid body', () => {

    cy.get('[data-test=bodyError]').should('not.exist');

    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');

    const toolongbody = 'a'.repeat(501);
    page.getFormField('body').clear().type(toolongbody).blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    page.getFormField('body').clear().type('Valid body').blur();
    cy.get('[data-test=bodyError]').should('not.exist');
  });
})

// Co Authoried TyBeas
