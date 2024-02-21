import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  readonly todoUrl: string = `${environment.apiUrl}todos`;

  constructor(private httpClient: HttpClient) {
  }

    /**
   *
   * @param filters
   * @returns
   *
   */

  getTodos(filters?: { body?: string; category?: string; sortBy?: string;}): Observable<Todo[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.body) {
        httpParams = httpParams.set('contains', filters.body);
      }
      if (filters.category) {
        httpParams = httpParams.set('category', filters.category);
      }
      if (filters.sortBy) {
        httpParams = httpParams.set('sortby', filters.sortBy);
      }
    }

    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `Todo` with the specified ID.
   *
   * @param id the ID of the desired todo
   * @returns an `Observable` containing the resulting todo.
   */
  getTodoById(id: string): Observable<Todo> {
    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }

  /**
   *
   * @param todos the array of `Todos` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Todos` matching the given filters
   */

  filterTodos(todos: Todo[], filters: { owner?: string; status?: boolean; limit?: number; body?: string;}): Todo[] {
    let filteredTodos = todos;

    if (filters.status != null) {
      filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
    }

    if(filters.owner) {
      filters.owner = filters.owner.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    }

    if(filters.limit) {
      filteredTodos = filteredTodos.slice(0,filters.limit)
    }

    if (filters.body) {
      filters.body = filters.body.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
    }

    return filteredTodos;
  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(res => res.id));
  }

  deleteTodo(id: string): Observable<void> {
    return this.httpClient.delete<void>(`/api/todos/${id}`);
  }
}
