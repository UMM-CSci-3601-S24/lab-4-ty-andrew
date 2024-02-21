import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';


describe('TodoService', () => {

  const testTodos: Todo[] = [
    {
      _id: "58895985c1849992336c219b",
      owner: "Fry",
      status: true,
      body: "Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.",
      category: "video games"
    },
    {
      _id: "58895985ae3b752b124e7663",
      owner: "Fry",
      status: true,
      body: "Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.",
      category: "homework"
    },
    {
      _id: "58895985186754887e0381f5",
      owner: "Blanche",
      status: false,
      body: "Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.",
      category: "software design"
    }
  ];
  let todoService: TodoService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
      todoService = new TodoService(httpClient);
    });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('getTodos()', () => {

    it('calls `api/todos` when `getTodos()` is called with no parameters', waitForAsync (() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));
      todoService.getTodos().subscribe((todos) => {
        expect(todos)
          .withContext('returns the test todos')
          .toBe(testTodos);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

    describe('When getTodos() is called with parameters, it correctly forms the HTTP request', () => {

      it('correctly calls api/todos with filter parameter \'video games\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ category: 'video games' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('category', 'video games') });
          });
      });

      it('correctly calls api/todos with filter parameter \'status\'', () => {
        todoService.getTodos({ sortBy: 'status' }).subscribe(
          todos => expect(todos).toBe(testTodos)
        )

        const req = httpTestingController.expectOne(
          (request) => request.url.startsWith(todoService.todoUrl) && request.params.has('sortby')
        );

        expect(req.request.method).toEqual('GET');
        expect(req.request.params.get('sortby')).toEqual('status');

        req.flush(testTodos);
      });



      it('correctly calls api/todos with filter parameter \'software design\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ category: 'software design' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('category', 'software design') });
          });
      });

      it('correctly calls api/todos with filter parameter \'body\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ body: 'Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('contains', 'Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.') });
          });
        });

      it('correctly calls api/todos with filter parameter \'body1\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

        todoService.getTodos({ body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('contains', 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.') });
          });
        });
    })

    describe('When getTodoById() is given an ID', () => {
      it('calls api/todos/id with the correct ID', waitForAsync(() => {
        const targetTodo: Todo = testTodos[1];
        const targetId: string = targetTodo._id;
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));
      todoService.getTodoById(targetId).subscribe((todo) => {
        expect(todo).withContext('returns the target todo').toBe(targetTodo);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
        });
      }));
    });

    describe('filterTodos()', () => {

      it('filters by owner', () => {
        const todoOwner = 'Fry';
        const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
          expect(filteredTodos.length).toBe(2);
        filteredTodos.forEach(todo => {
          expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
        })
      });

      it('filters by body', () => {
        const todoBody = 'Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.';
        const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
          expect(filteredTodos.length).toBe(1);
        filteredTodos.forEach(todo => {
          expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
        })
      });

      it('filters by body1', () => {
        const todoBody = 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.';
        const filteredTodos = todoService.filterTodos(testTodos, { body: todoBody });
          expect(filteredTodos.length).toBe(1);
        filteredTodos.forEach(todo => {
          expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
        })
      });

      it('filters by status true', () => {
        const todoStatus = true;
        const filteredTodos = todoService.filterTodos(testTodos, { status: todoStatus });
          expect(filteredTodos.length).toBe(2);
        filteredTodos.forEach(todo => {
          expect(todo.status === todoStatus);
        })
      });

      it('filters by status false', () => {
        const todoStatus = false;
        const filteredTodos = todoService.filterTodos(testTodos, { status: todoStatus });
          expect(filteredTodos.length).toBe(1);
        filteredTodos.forEach(todo => {
          expect(todo.status === todoStatus);
        })
      });

      it('filters by limit', () => {
        const filteredTodos = todoService.filterTodos(testTodos, { limit: 2});
        expect(filteredTodos.length).toBe(2);
      });

      it('filters by empty', () => {
        const filteredTodos = todoService.filterTodos(testTodos, {});
        expect(filteredTodos.length).toBe(3);
      });

      it('filters by owner, status, body ', () => {
        const todoOwner = 'Fry';
        const todoStatus = true;
        const todoBody = 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.';
        const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner, status: todoStatus, body: todoBody});
        filteredTodos.forEach(todo => {
          expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
          expect(todo.body.indexOf(todoBody)).toBeGreaterThanOrEqual(0);
          expect(todo.status === todoStatus);
          })
        });



      it('filters by owner, status, and limit ', () => {
        const todoOwner = 'Fry';
        const todoStatus = true;
        const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner, status: todoStatus, limit: 1 });
          expect(filteredTodos.length).toBe(1);
        filteredTodos.forEach(todo => {
          expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
          expect(todo.status === todoStatus);
          })
        });
     });

    describe('Adding a todo using `addTodo()`', () => {
      it('talks to the right endpoint and is called once', waitForAsync(() => {
        const todo_id = 'pat_id';
        const expected_http_response = { id: todo_id } ;

        // Mock the `httpClient.addTodo()` method, so that instead of making an HTTP request,
        // it just returns our expected HTTP response.
        const mockedMethod = spyOn(httpClient, 'post')
          .and
          .returnValue(of(expected_http_response));

        todoService.addTodo(testTodos[1]).subscribe((new_todo_id) => {
          expect(new_todo_id).toBe(todo_id);
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(todoService.todoUrl, testTodos[1]);
        });
      }));
    });

    describe('Removing a todo using `deleteTodo()`', () => {
      it('talks to the right endpoint and is called once', waitForAsync(() => {
        const todo_id = 'pat_id';
        const expected_http_response = { todo_id };
        const mockedMethod = spyOn(httpClient, 'delete')
          .and
          .returnValue(of(expected_http_response));

        todoService.deleteTodo(todo_id).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(`${todoService.todoUrl}/pat_id`);

          });
        }));
      });
  });


