import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of, throwError, timer, interval } from 'rxjs';
import { map, filter, tap, catchError, switchMap, debounceTime, distinctUntilChanged, 
  takeUntil, shareReplay, retry, mergeMap, concatMap, exhaustMap, scan, reduce } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // BehaviorSubject maintains the latest value and emits it to new subscribers
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  
  // Subject doesn't maintain current value, only emits new values to subscribers
  private notificationSubject = new Subject<string>();
  notifications$ = this.notificationSubject.asObservable();
  
  // Sample API URL
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) {
    // Initialize with some data
    this.loadUsers();
  }

  // BASIC EXAMPLES
  
  // Simple Observable creation
  getSimpleObservable(): Observable<number> {
    return of(1, 2, 3, 4, 5);
  }
  
  // HTTP request returning an Observable
  loadUsers(): void {
    this.http.get<User[]>(this.apiUrl)
      .pipe(
        tap(users => console.log('Users loaded:', users)),
        catchError(error => {
          console.error('Error loading users', error);
          return of([]);
        })
      )
      .subscribe(users => this.usersSubject.next(users));
  }
  
  // Update the BehaviorSubject with new data
  addUser(user: User): void {
    const currentUsers = this.usersSubject.getValue();
    this.usersSubject.next([...currentUsers, user]);
    this.notificationSubject.next(`User ${user.name} added!`);
  }
  
  // INTERMEDIATE EXAMPLES
  
  // Combining operators
  getActiveUsers(): Observable<User[]> {
    return this.users$.pipe(
      map(users => users.filter(user => user.active)),
      tap(activeUsers => console.log('Active users:', activeUsers))
    );
  }
  
  // Error handling with catchError and retry
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      retry(3), // Retry failed request up to 3 times
      catchError(error => {
        console.error(`Error fetching user with ID ${id}`, error);
        return throwError(() => new Error(`User with ID ${id} not found`));
      })
    );
  }
  
  // Debouncing API calls (useful for search inputs)
  searchUsers(term: Observable<string>): Observable<User[]> {
    return term.pipe(
      debounceTime(300), // Wait 300ms after each keystroke
      distinctUntilChanged(), // Only emit if the search term changed
      switchMap(searchTerm => {
        if (!searchTerm.trim()) {
          return of([]);
        }
        return this.http.get<User[]>(`${this.apiUrl}?name_like=${searchTerm}`);
      }),
      catchError(error => {
        console.error('Error searching users', error);
        return of([]);
      })
    );
  }
  
  // ADVANCED EXAMPLES
  
  // Caching data with shareReplay
  private cachedUsers$!: Observable<User[]>;
  
  getCachedUsers(): Observable<User[]> {
    if (!this.cachedUsers$) {
      this.cachedUsers$ = this.http.get<User[]>(this.apiUrl).pipe(
        shareReplay(1) // Cache the last emitted value
      );
    }
    return this.cachedUsers$;
  }
  
  // Different flattening strategies
  // 1. MergeMap - Subscribes to inner Observable immediately, 
  // maintains multiple inner subscriptions at once
  processUsersWithMergeMap(): Observable<User> {
    return this.users$.pipe(
      mergeMap(users => of(...users)) // Flatten array of users into individual user emissions
    );
  }
  
  // 2. ConcatMap - Waits for inner Observable to complete before processing next
  processUsersWithConcatMap(): Observable<User> {
    return this.users$.pipe(
      concatMap(users => of(...users)) // Process users one by one in sequence
    );
  }
  
  // 3. SwitchMap - Cancels previous inner Observable when new outer value arrives
  simulateUserSearch(searchTerms: Observable<string>): Observable<User[]> {
    return searchTerms.pipe(
      debounceTime(300),
      switchMap(term => {
        // Cancel previous search request if a new term is typed
        return this.http.get<User[]>(`${this.apiUrl}?name_like=${term}`);
      })
    );
  }
  
  // 4. ExhaustMap - Ignores new outer values while inner Observable is active
  // Useful for login/submit operations to prevent duplicate requests
  simulateLogin(credentials: Observable<{username: string, password: string}>): Observable<{token: string}> {
    return credentials.pipe(
      exhaustMap(creds => {
        // Simulate a login HTTP request that takes time
        return timer(1000).pipe(
          map(() => ({ token: 'fake-jwt-token' }))
        );
      })
    );
  }
  
  // Higher order Observable transformations with scan and reduce
  getUsersStatistics(): Observable<{count: number, names: string[]}> {
    return this.users$.pipe(
      // Scan is like reduce but emits intermediate results
      scan((acc, users) => {
        return {
          count: users.length,
          names: users.map(user => user.name)
        };
      }, { count: 0, names: [] as string[] })
    );
  }
  
  // Accumulate values until completion with reduce
  sumUserIds(): Observable<number> {
    return this.processUsersWithMergeMap().pipe(
      reduce((acc, user) => acc + user.id, 0)
    );
  }
  
  // Multicasting with Subject
  broadcastNotification(message: string): void {
    this.notificationSubject.next(message);
  }
}