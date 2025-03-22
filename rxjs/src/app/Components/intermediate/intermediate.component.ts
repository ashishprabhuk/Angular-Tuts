import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription, interval, fromEvent } from 'rxjs';
import { map, takeUntil, take, filter, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DataService } from '../../Services/data.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-intermediate',
  templateUrl: './intermediate.component.html',
  styleUrls: ['./intermediate.component.scss'],
  standalone: false
})
export class IntermediateComponent implements OnInit, OnDestroy {
  activeUsersCount = 0;
  searchControl = new FormControl('');
  searchResults: User[] = [];
  isSearching = false;
  selectedUser: User | null = null;
  errorMessage = '';
  counterValue = 0;
  
  private destroy$ = new Subject<void>();
  private counter$: Observable<number> | null = null;
  private subscriptions = new Subscription();
  
  constructor(private dataService: DataService) {}
  
  ngOnInit(): void {
    // Set up the search with debounceTime and distinctUntilChanged
    this.subscriptions.add(
      this.dataService.searchUsers(this.searchControl.valueChanges.pipe(filter(value => value !== null)))
        .pipe(
          tap(() => {
            this.isSearching = true;
            this.errorMessage = '';
          })
        )
        .subscribe({
          next: results => {
            this.searchResults = results;
            this.isSearching = false;
          },
          error: err => {
            this.errorMessage = 'Search failed: ' + err.message;
            this.isSearching = false;
          }
        })
    );
  }
  
  filterActiveUsers(): void {
    this.subscriptions.add(
      this.dataService.getActiveUsers().subscribe(activeUsers => {
        this.activeUsersCount = activeUsers.length;
      })
    );
  }
  
  getUserById(idStr: string): void {
    this.selectedUser = null;
    this.errorMessage = '';
    
    const id = parseInt(idStr, 10);
    if (!id || isNaN(id)) {
      this.errorMessage = 'Please enter a valid user ID';
      return;
    }
    
    this.subscriptions.add(
      this.dataService.getUserById(id).subscribe({
        next: user => this.selectedUser = user,
        error: err => this.errorMessage = err.message
      })
    );
  }
  
  startCounter(): void {
    // Reset counter
    this.counterValue = 0;
    
    // Create an interval Observable that emits every second
    this.counter$ = interval(1000).pipe(
      // Take only 5 values
      take(5),
      // Map the index to a more readable counter
      map(i => i + 1),
      // Stop when component is destroyed
      takeUntil(this.destroy$)
    );
    
    // Subscribe to the counter
    this.subscriptions.add(
      this.counter$.subscribe({
        next: val => this.counterValue = val,
        complete: () => console.log('Counter completed')
      })
    );
  }
  
  stopCounter(): void {
    // Signal to complete the counter
    this.destroy$.next();
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions and complete subjects
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}