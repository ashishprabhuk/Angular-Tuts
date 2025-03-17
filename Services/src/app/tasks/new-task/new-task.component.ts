import { Component, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../tasks.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
})
export class NewTaskComponent {
  private formEl = viewChild<ElementRef<HTMLFormElement>>('form');

  /*
   * @param {TasksService} taskService 
   *
   * Flaw: This constructor assigns an instance of TasksService to the current component,
   * meaning that each instance of this component will get its own separate instance of
   * TasksService if not provided as a singleton in a shared module or service provider.
   * This can lead to inconsistent state across components.
   *
   * Solution:
   * Ensure TasksService is provided in a shared module or at the root level:
   *
   * @Injectable({
   *   providedIn: 'root'
   * })
   * export class TasksService { ... }
   *
   * This ensures that the same instance is shared across components instead of
   * creating new instances for each component that injects it.
   */

  // private taskService: TasksService;

  // constructor(taskService: TasksService) {
  //   this.taskService = taskService;
  // }


  /*
   * @param {TasksService} taskService 
   *
   * Solution: Using TypeScript's parameter properties in the constructor
   * allows automatic declaration and assignment, making the code cleaner.
   *
   * This approach ensures that the same instance of TasksService is used
   * across all components that inject it.
   */

  /* Dependency Injection using constructor*/
  constructor(private taskService: TasksService) {}

  onAddTask(title: string, description: string) {
    this.taskService.addTask({ title, description });
    this.formEl()?.nativeElement.reset();
  }
}
