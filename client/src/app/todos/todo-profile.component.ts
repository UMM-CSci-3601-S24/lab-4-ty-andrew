import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TodoCardComponent } from './todo-card.component';

import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-user-profile',
    templateUrl: './todo-profile.component.html',
    styleUrls: ['./todo-profile.component.scss'],
    standalone: true,
    imports: [TodoCardComponent, MatCardModule]
})
export class TodoProfileComponent implements OnInit, OnDestroy {
  todo: Todo;
  error: { help: string, httpResponse: string, message: string };

  // This `Subject` will only ever emit one (empty) value when
  // `ngOnDestroy()` is called, i.e., when this component is
  // destroyed. That can be used ot tell any subscriptions to
  // terminate, allowing the system to free up their resources (like memory).
  private ngUnsubscribe = new Subject<void>();

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private todoService: TodoService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.todoService.getTodoById(id)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: todo => {
        this.todo = todo;
        return todo;
      },
      error: _err => {
        this.error = {
          help: 'There was a problem loading the todo – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        };
      }
      /*
       * You can uncomment the line that starts with `complete` below to use that console message
       * as a way of verifying that this subscription is completing.
       * We removed it since we were not doing anything interesting on completion
       * and didn't want to clutter the console log
       */
      // complete: () => console.log('We got a new user, and we are done!'),
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
