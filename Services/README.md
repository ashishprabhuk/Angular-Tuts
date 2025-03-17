# Angular Services - Deep Dive

## Introduction
Angular services are essential for creating modular, reusable, and testable code. They enable data sharing across components and encapsulate business logic, making the application maintainable.

## What is a Service in Angular?
A service is a class decorated with `@Injectable()`, designed to encapsulate logic, interact with APIs, manage data, and handle shared functionalities.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes it available application-wide
})
export class DataService {
  private data: string = 'Angular Services';
  
  getData(): string {
    return this.data;
  }

  setData(value: string): void {
    this.data = value;
  }
}
```

## Why Use Services?
- Code reusability
- Data sharing across components
- Separation of concerns
- Improves testability

## Dependency Injection (DI) in Angular Services
Dependency Injection (DI) allows services to be injected into components, directives, or other services.

### **Injecting a Service into a Component**

```typescript
import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-example',
  template: `<p>{{ message }}</p>`
})
export class ExampleComponent {
  message: string;

  constructor(private dataService: DataService) {
    this.message = this.dataService.getData();
  }
}
```

### **Hierarchical Dependency Injection**
Angular allows service scope to be defined at different levels:
1. **Root Module (`providedIn: 'root'`)** - Singleton instance available application-wide.
2. **Feature Module (`providers: [Service]` in `@NgModule`)** - Instance available within a specific module.
3. **Component Level (`providers: [Service]` in `@Component`)** - Instance specific to the component and its children.

```typescript
@NgModule({
  providers: [FeatureService]
})
export class FeatureModule {}
```

```typescript
@Component({
  selector: 'app-component',
  providers: [ComponentService]
})
export class ExampleComponent {}
```

## Types of Services in Angular
### **1. Singleton Services**
- Created using `providedIn: 'root'`.
- A single instance is shared across the app.

### **2. Non-Singleton Services**
- Provided at module or component level.
- Different instances exist in different components or modules.

## Communication Using Services
### **1. Sharing Data Between Components**
#### Using BehaviorSubject from RxJS:
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private messageSource = new BehaviorSubject<string>('Initial Data');
  currentMessage = this.messageSource.asObservable();

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
```

#### **Receiving Data in Components**
```typescript
export class SenderComponent {
  constructor(private sharedService: SharedService) {}

  updateMessage() {
    this.sharedService.changeMessage('New Data');
  }
}
```

```typescript
export class ReceiverComponent {
  message: string;

  constructor(private sharedService: SharedService) {
    this.sharedService.currentMessage.subscribe(msg => this.message = msg);
  }
}
```

## Interacting with APIs using Services
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
```

#### **Using the API Service in a Component**
```typescript
export class PostsComponent {
  posts: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPosts().subscribe(data => this.posts = data);
  }
}
```

## Best Practices for Angular Services
- Use services for business logic, not components.
- Use `providedIn: 'root'` for singleton services unless specific scope is needed.
- Use RxJS observables for data sharing.
- Always unsubscribe from observables in `ngOnDestroy()` when needed.
- Keep services small and focused on single responsibility.

## Conclusion
Angular services are a powerful way to share logic, fetch data, and improve maintainability. Understanding dependency injection and service scopes is essential for building scalable applications.

---
By mastering Angular services, you ensure better code organization and reusability across your projects.
