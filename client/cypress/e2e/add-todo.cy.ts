// import { Todo } from 'src/app/todos/todo';
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
    page.getFormField('status').type('Complete');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('Video Games');
    page.addUserButton().should('be.disabled');
    page.getFormField('body').type('anythinghere');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });
})
