import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription, of, fromEvent, merge } from 'rxjs';
import { map, mergeMap, concatMap, switchMap, exhaustMap, tap, 
  takeUntil, shareReplay, withLatestFrom, scan, buffer, debounceTime, 
  take,
  filter} from 'rxjs/operators';
import { DataService } from '../../Services/data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-advanced',
  standalone: false,
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.scss'
})
export class AdvancedComponent implements OnInit, OnDestroy {
  cachedUsersCount = 0;
  processingResults: string[] = [];
  multiClickCount = 0;
  userStats: { count: number, names: string[] } = { count: 0, names: [] };
  userIdSum = 0;
  
  private destroy$ = new Subject<void>();
  private searchTerms = new BehaviorSubject<string>('');
  private loginAttempts = new Subject<{username: string, password: string}>();
  private subscriptions = new Subscription();
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    // Subscribe to user statistics
    this.subscriptions.add(
      this.dataService.getUsersStatistics()
        .pipe(takeUntil(this.destroy$))
        .subscribe(stats => {
          this.userStats = stats;
        })
    );
  }
  
  loadCachedUsers(): void {
    // This will only make one HTTP request regardless of how many times you click
    this.subscriptions.add(
      this.dataService.getCachedUsers().subscribe(users => {
        this.cachedUsersCount = users.length;
        console.log('Got cached users, length:', users.length);
      })
    );
  }
  
  demonstrateMergeMap(): void {
    this.processingResults = [];
    this.subscriptions.add(
      this.dataService.processUsersWithMergeMap()
        .pipe(
          // Take just the first 5 results for demo purposes
          take(5),
          map(user => user.name)
        )
        .subscribe(name => {
          this.processingResults.push(name);
          console.log('MergeMap processed:', name);
        })
    );
  }
  
  demonstrateConcatMap(): void {
    this.processingResults = [];
    this.subscriptions.add(
      this.dataService.processUsersWithConcatMap()
        .pipe(
          take(5),
          map(user => user.name)
        )
        .subscribe(name => {
          this.processingResults.push(name);
          console.log('ConcatMap processed:', name);
        })
    );
  }
  
  demonstrateSwitchMap(): void {
    this.processingResults = [];
    
    // Simulate rapid search term changes
    const terms = ['a', 'al', 'ali', 'alic', 'alice'];
    
    // Clear any previous subscriptions
    this.searchTerms.next('');
    
    // Emit each search term with delay
    let i = 0;
    const interval = setInterval(() => {
      if (i < terms.length) {
        this.searchTerms.next(terms[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    
    // Subscribe to simulated search results
    this.subscriptions.add(
      this.dataService.simulateUserSearch(this.searchTerms.asObservable())
        .subscribe(users => {
          this.processingResults = users.map(u => u.name);
          console.log('SwitchMap results:', users.map(u => u.name));
        })
    );
  }
  
  demonstrateExhaustMap(): void {
    this.processingResults = [];
    
    // Simulate multiple rapid login attempts
    // exhaustMap will ignore subsequent emissions until the first completes
    this.loginAttempts.next({ username: 'user1', password: 'pass1' });
    
    // These will be ignored by exhaustMap until the first completes
    setTimeout(() => this.loginAttempts.next({ username: 'user2', password: 'pass2' }), 200);
    setTimeout(() => this.loginAttempts.next({ username: 'user3', password: 'pass3' }), 400);
    
    this.subscriptions.add(
      this.dataService.simulateLogin(this.loginAttempts)
        .subscribe(result => {
          this.processingResults = ['Login successful, token: ' + result.token];
          console.log('ExhaustMap result:', result);
        })
    );
  }
  
  setupMultiClickDetection(button: HTMLButtonElement): void {
    // Create an Observable from click events
    const click$ = fromEvent(button, 'click');
    
    // Buffer clicks until there's a 300ms pause
    this.subscriptions.add(
      click$.pipe(
        buffer(click$.pipe(debounceTime(300))),
        // Only care about multiple clicks (2+)
        filter(clicks => clicks.length >= 2),
        takeUntil(this.destroy$)
      ).subscribe(clicks => {
        this.multiClickCount++;
        console.log(`Detected ${clicks.length} clicks`);
      })
    );
  }
  
  addRandomUser(): void {
    const randomId = Math.floor(Math.random() * 1000);
    const newUser: User = {
      id: randomId,
      name: `User ${randomId}`,
      email: `user${randomId}@example.com`,
      active: Math.random() > 0.3
    };
    
    this.dataService.addUser(newUser);
  }
  
  calculateUserIdSum(): void {
    this.subscriptions.add(
      this.dataService.sumUserIds().subscribe(sum => {
        this.userIdSum = sum;
      })
    );
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
