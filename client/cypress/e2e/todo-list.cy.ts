import { TodoListPage } from "cypress/support/todo-list.po";

const page = new TodoListPage();

describe('Todo List', () => {
  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct page title', () => {
    page.getPageTitle().should('eq', 'Todos');
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('should filter todos by owner', () => {
    const ownerFilter = 'Fry';
    page.changeView('list');
    page.getTodoListItems().should('have.length.greaterThan', 0);
    cy.get('[data-test=todoOwnerInput]').type(ownerFilter);
    cy.get('.todo-list-item .todo-list-owner').each(($owner) => {
      cy.wrap($owner).should('include.text', ownerFilter);
    });
  });

  it('should filter todos by category', () => {
    const categoryFilter = 'Video Games';
    page.changeView('list');
    page.getTodoListItems().should('have.length.greaterThan', 0);
    cy.get('[data-test=todoCategorySelect]').click();
    cy.get('mat-option').contains(categoryFilter).click()
    cy.get('.todo-list-item .todo-list-category').each(($category) => {
      cy.wrap($category).should('include.text', 'video games');
    });
  });

  it('should filter todos by status', () => {
    const statusFilter = 'Complete';
    page.changeView('list');
    page.getTodoListItems().should('have.length.greaterThan', 0);
    cy.get('[data-test=todoStatusSelect]').click();
    cy.get('mat-option').contains(statusFilter).click()
    cy.get('.todo-list-item .todo-list-status').each(($status) => {
      cy.wrap($status).should('include.text', 'Complete');
    });
  });

  it('should filter todos by status', () => {
    const statusFilter = 'Incomplete';
    page.changeView('list');
    page.getTodoListItems().should('have.length.greaterThan', 0);
    cy.get('[data-test=todoStatusSelect]').click();
    cy.get('mat-option').contains(statusFilter).click()
    cy.get('.todo-list-item .todo-list-status').each(($status) => {
      cy.wrap($status).should('include.text', 'Incomplete');
    });
  });

  it('Should type something in the Category filter and check that it returned correct elements', () => {
    page.changeView('card');
    cy.get('[data-test=todoCategorySelect]').type('software design');

    page.getTodoCards().should('have.lengthOf.above', 0);
  });

  it('Should type a name in the owner filter and check that it returned correct elements', () => {
    cy.get('[data-test=todoOwnerInput]').type('Blanche');
    page.getTodoCards().should('have.lengthOf', 43);
    page.getTodoCards().find('.todo-card-owner').each($card => {
      cy.wrap($card).should('have.text', 'Blanche');
    })

    page.getTodoCards().find('.todo-card-owner')
      .should('not.contain.text', 'Fry')
      .should('not.contain.text', 'Ty')
      .should('not.contain.text', 'Andrew');
  });

  it('Should have sth in contains and check that it returned correct elements', () => {
    page.changeView('list');
    cy.get('[data-test=todoBodyInput]').type('in sunt');
    page.getTodoListItems().find('.todo-list-body').each($body =>
      expect($body.text().toLowerCase()).to.contain('in sunt')
    );
  });

  it('Should type an owner, select status, category and check that it returned the correct elements', () => {
    page.changeView('list');

    cy.get('[data-test=todoOwnerInput]').type('Blanche');

    // cy.get('[data-test=todoStatusSelect]').click()
    //   .get(`mat-option[value]="true"`).click();

      cy.get('[data-test=todoCategorySelect]').click()
      .get(`mat-option[value="homework"]`).click();

    page.getTodoListItems().each($todo => {
      cy.wrap($todo).find('.todo-list-status').should('contain', 'Complete');
      cy.wrap($todo).find('.todo-list-category').should('contain', 'homework');
      cy.wrap($todo).find('.todo-list-owner').should('contain', 'Blanche');
    });
  });

  it('Should click add todo and go to the right URL', () => {

    page.addTodoButton().click();

    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });
})
