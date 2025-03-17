```markdown
# Angular Services: In-Depth Guide

## Introduction to Services
Services in Angular are **singleton objects** designed to encapsulate business logic, data sharing, and external communication. They are injectable across components, directives, and other services via Angular's **Dependency Injection (DI)** system.

Key Purposes:
- Share data or logic across components.
- Centralize HTTP requests.
- Handle authentication, logging, or state management.

---

## Creating a Service
Use the Angular CLI to generate a service:
```bash
ng generate service data
```

**Example Service**:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Service is available app-wide
})
export class DataService {
  private apiUrl = 'https://api.example.com/data';

  constructor(private http: HttpClient) { }

  fetchData() {
    return this.http.get(this.apiUrl);
  }
}
```

---

## Dependency Injection (DI) in Depth
Angular's DI system manages service instantiation and injection. 

### How DI Works:
1. **Injector Hierarchy**: Angular creates a tree of injectors (root, module, component).
2. **Provider Lookup**: When a service is requested, Angular checks the injector hierarchy upwards until it finds a provider.

### Providing Services
- **Root Level** (`providedIn: 'root'`):
  - Singleton instance for the entire app.
  ```typescript
  @Injectable({ providedIn: 'root' })
  ```
- **Module Level** (NgModule `providers` array):
  - Available to all components/directives in that module.
  ```typescript
  @NgModule({
    providers: [DataService]
  })
  ```
- **Component Level** (Component `providers` array):
  - Instance scoped to the component and its children.
  ```typescript
  @Component({
    providers: [DataService]
  })
  ```

---

## Common Use Cases for Services

### 1. HTTP Communication
Centralize API calls using `HttpClient`:
```typescript
getUser(id: number) {
  return this.http.get(`${this.apiUrl}/users/${id}`);
}
```

### 2. State Management
Share data between components:
```typescript
private dataSubject = new BehaviorSubject<string>('');
public data$ = this.dataSubject.asObservable();

updateData(newData: string) {
  this.dataSubject.next(newData);
}
```

### 3. Logging and Error Handling
Global error handler service:
```typescript
logError(error: any) {
  console.error('Error:', error);
  // Send to logging server
}
```

---

## Advanced Concepts

### Interceptors
Modify HTTP requests/responses globally:
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer token')
    });
    return next.handle(authReq);
  }
}
```

### Singleton Services
- Use `providedIn: 'root'` or include the service once in the root module.
- Avoid re-providing the service in lazy-loaded modules to prevent multiple instances.

### Testing Services
Use `TestBed` to mock dependencies:
```typescript
describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch data', () => {
    service.fetchData().subscribe();
    const req = httpMock.expectOne('https://api.example.com/data');
    expect(req.request.method).toBe('GET');
  });
});
```

---

## Best Practices
1. **Single Responsibility**: Each service should handle one specific task.
2. **Avoid Component Logic**: Keep components focused on UI/presentation.
3. **Lazy-Loading**: Use `providedIn: 'root'` cautiously with lazy-loaded modules to avoid unintended singletons.
4. **Unsubscribe in Services**: Use `takeUntil` or other patterns to manage subscriptions.

---

## Conclusion
Services are the backbone of Angular applications, enabling reusable, testable, and maintainable code. Mastery of dependency injection, scoping, and advanced patterns ensures efficient and scalable app architecture.
```