import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Todo } from '../app/todos/todo';
import { TodoService } from '../app/todos/todo.service';

@Injectable()
export class MockTodoService extends TodoService {
  static testTodos: Todo[] = [
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

  constructor() {
    super(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTodos(_filters?: { status?: boolean; bodyText?: string; owner?: string; category?: string}): Observable<Todo[]> {
    return of(MockTodoService.testTodos);
  }

  // skipcq: JS-0105
  getTodoById(id: string): Observable<Todo> {
    // If the specified ID is for one of the test todos,
    // return that todo, otherwise return `null` so
    // we can test illegal todo requests.
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else if (id === MockTodoService.testTodos[1]._id) {
      return of(MockTodoService.testTodos[1]);
    } else {
      return of(null);
    }
  }

}
